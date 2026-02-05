/*
  # إضافة الأوقات المتاحة الافتراضية للحجز
  
  1. وظيفة لإنشاء الأوقات المتاحة
    - تنشئ أوقات من 8:00 صباحاً إلى 7:00 مساءً
    - كل فترة 15 دقيقة
    - للأيام الـ 60 القادمة
  
  2. ملاحظات مهمة
    - يتم إنشاء الأوقات لخدمة Wakala فقط
    - الأوقات افتراضياً متاحة
    - يمكن للمسؤول تعديل أو حجب الأوقات لاحقاً
*/

-- دالة لإنشاء الأوقات المتاحة تلقائياً
CREATE OR REPLACE FUNCTION generate_wakala_slots()
RETURNS void AS $$
DECLARE
  v_service_id UUID;
  v_current_date DATE;
  v_end_date DATE;
  v_slot_time TIME;
  v_slot_end_time TIME;
BEGIN
  -- الحصول على خدمة Wakala
  SELECT id INTO v_service_id FROM booking_services WHERE name_en = 'Wakala Services' LIMIT 1;
  
  IF v_service_id IS NULL THEN
    RAISE NOTICE 'Wakala Services not found';
    RETURN;
  END IF;
  
  -- تحديد نطاق التواريخ (60 يوم قادم)
  v_current_date := CURRENT_DATE;
  v_end_date := v_current_date + INTERVAL '60 days';
  
  -- حذف الأوقات القديمة إذا كانت موجودة
  DELETE FROM availability_slots 
  WHERE service_id = v_service_id 
  AND date >= v_current_date;
  
  -- إنشاء الأوقات لكل يوم
  WHILE v_current_date <= v_end_date LOOP
    -- إنشاء فترات زمنية من 8:00 صباحاً حتى 7:00 مساءً (كل 15 دقيقة)
    v_slot_time := '08:00:00'::TIME;
    WHILE v_slot_time < '19:00:00'::TIME LOOP
      v_slot_end_time := v_slot_time + INTERVAL '15 minutes';
      
      INSERT INTO availability_slots (
        service_id,
        date,
        start_time,
        end_time,
        is_available,
        is_blocked_by_admin
      ) VALUES (
        v_service_id,
        v_current_date,
        v_slot_time,
        v_slot_end_time,
        true,
        false
      );
      
      v_slot_time := v_slot_end_time;
    END LOOP;
    
    v_current_date := v_current_date + 1;
  END LOOP;
  
  RAISE NOTICE 'Successfully generated slots from % to %', CURRENT_DATE, v_end_date;
END;
$$ LANGUAGE plpgsql;

-- تنفيذ الدالة لإنشاء الأوقات
SELECT generate_wakala_slots();
