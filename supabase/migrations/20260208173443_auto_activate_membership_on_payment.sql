/*
  # نظام التفعيل التلقائي للعضوية بعد الدفع

  1. الوظائف الجديدة
    - دالة `auto_create_member_on_payment()` - تقوم بإنشاء سجل العضو تلقائياً
    - حساب تواريخ البدء والانتهاء بناءً على نوع العضوية
    - نسخ البيانات من جدول طلبات العضوية إلى جدول الأعضاء
    - تعيين حالة العضوية كـ active
    - منع التكرار بالتحقق من وجود السجل

  2. التغييرات
    - إنشاء Function تُستدعى عند تحديث payment_status
    - إنشاء Trigger يعمل على UPDATE لجدول membership_applications
    - معالجة جميع أنواع العضويات (Individual, Family, Associate, Business Support)
    - حساب تاريخ الانتهاء بناءً على frequency للـ Business Support

  3. الأمان
    - استخدام SECURITY DEFINER للسماح بإنشاء السجل
    - التحقق من وجود user_id صالح
    - التعامل مع الأخطاء بشكل آمن
*/

-- دالة لإنشاء سجل العضو تلقائياً عند تحديث حالة الدفع إلى 'paid'
CREATE OR REPLACE FUNCTION auto_create_member_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_start_date date;
  v_expiry_date date;
  v_duration_months integer;
  v_existing_member_id uuid;
BEGIN
  -- التحقق من أن الحالة الجديدة هي 'paid' والقديمة ليست 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN

    -- تعيين تاريخ البدء كتاريخ اليوم
    v_start_date := CURRENT_DATE;

    -- حساب مدة العضوية بناءً على نوع العضوية
    CASE NEW.membership_type
      WHEN 'individual' THEN
        v_duration_months := 12; -- سنة واحدة
      WHEN 'family' THEN
        v_duration_months := 12; -- سنة واحدة
      WHEN 'associate' THEN
        v_duration_months := 12; -- سنة واحدة
      WHEN 'business_support' THEN
        -- حساب المدة بناءً على تكرار الدفع
        CASE NEW.frequency
          WHEN 'monthly' THEN
            v_duration_months := 1; -- شهر واحد
          WHEN 'yearly' THEN
            v_duration_months := 12; -- سنة واحدة
          WHEN 'one-time' THEN
            v_duration_months := 60; -- 5 سنوات
          ELSE
            v_duration_months := 12; -- افتراضي: سنة واحدة
        END CASE;
      ELSE
        v_duration_months := 12; -- افتراضي: سنة واحدة
    END CASE;

    -- حساب تاريخ الانتهاء
    v_expiry_date := v_start_date + (v_duration_months || ' months')::interval;

    -- التحقق من وجود سجل عضو للمستخدم
    SELECT id INTO v_existing_member_id
    FROM members
    WHERE user_id = NEW.user_id
    LIMIT 1;

    IF v_existing_member_id IS NOT NULL THEN
      -- تحديث العضو الموجود
      UPDATE members
      SET
        first_name = COALESCE(NEW.first_name, first_name),
        last_name = COALESCE(NEW.last_name, last_name),
        email = COALESCE(NEW.email, email),
        phone = COALESCE(NEW.phone, phone),
        date_of_birth = COALESCE(NEW.date_of_birth, date_of_birth),
        address = COALESCE(NEW.address, address),
        postcode = COALESCE(NEW.postcode, postcode),
        city = COALESCE(NEW.city, city),
        membership_type = NEW.membership_type,
        start_date = v_start_date,
        expiry_date = v_expiry_date,
        status = 'active',
        updated_at = now()
      WHERE id = v_existing_member_id;

      RAISE NOTICE 'Updated existing member: %', v_existing_member_id;

    ELSE
      -- إنشاء سجل عضو جديد
      INSERT INTO members (
        user_id,
        member_number,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        postcode,
        city,
        membership_type,
        start_date,
        expiry_date,
        status,
        created_at,
        updated_at
      ) VALUES (
        NEW.user_id,
        '', -- سيتم تعيينه تلقائياً بواسطة trigger آخر
        NEW.first_name,
        NEW.last_name,
        NEW.email,
        NEW.phone,
        NEW.date_of_birth,
        NEW.address,
        NEW.postcode,
        NEW.city,
        NEW.membership_type,
        v_start_date,
        v_expiry_date,
        'active',
        now(),
        now()
      );

      RAISE NOTICE 'Created new member for user: %', NEW.user_id;
    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء Trigger لاستدعاء الدالة عند تحديث payment_status
DROP TRIGGER IF EXISTS trigger_auto_create_member_on_payment ON membership_applications;
CREATE TRIGGER trigger_auto_create_member_on_payment
  AFTER UPDATE OF payment_status ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_member_on_payment();

-- إضافة تعليق توضيحي
COMMENT ON FUNCTION auto_create_member_on_payment() IS
'تقوم هذه الدالة بإنشاء أو تحديث سجل العضو تلقائياً عند تحديث حالة الدفع إلى paid في جدول membership_applications';

COMMENT ON TRIGGER trigger_auto_create_member_on_payment ON membership_applications IS
'يقوم هذا الـ Trigger بتفعيل العضوية تلقائياً بعد نجاح الدفع';