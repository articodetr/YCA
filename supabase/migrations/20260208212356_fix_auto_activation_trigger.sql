/*
  # إصلاح التفعيل التلقائي للعضوية

  1. التغييرات
    - تصحيح دالة auto_create_member_on_payment لاستخدام id بدلاً من user_id
    - جدول members يستخدم id (UUID من auth.users) وليس user_id منفصل
    - تحديث المنطق للبحث والإنشاء بشكل صحيح

  2. الإصلاحات
    - استخدام NEW.user_id كـ id في جدول members
    - إصلاح الاستعلامات للبحث عن السجلات الموجودة
    - التأكد من عدم وجود تكرار
*/

-- حذف الدالة القديمة
DROP FUNCTION IF EXISTS auto_create_member_on_payment() CASCADE;

-- إنشاء دالة محدثة
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
    
    -- التحقق من وجود user_id
    IF NEW.user_id IS NULL THEN
      RAISE NOTICE 'Cannot create member: user_id is NULL for application %', NEW.id;
      RETURN NEW;
    END IF;

    -- تعيين تاريخ البدء كتاريخ اليوم
    v_start_date := CURRENT_DATE;

    -- حساب مدة العضوية بناءً على نوع العضوية
    CASE NEW.membership_type
      WHEN 'individual' THEN
        v_duration_months := 12;
      WHEN 'family' THEN
        v_duration_months := 12;
      WHEN 'student' THEN
        v_duration_months := 12;
      WHEN 'associate' THEN
        v_duration_months := 12;
      WHEN 'business_support' THEN
        CASE NEW.frequency
          WHEN 'monthly' THEN
            v_duration_months := 1;
          WHEN 'yearly' THEN
            v_duration_months := 12;
          WHEN 'one-time' THEN
            v_duration_months := 60;
          ELSE
            v_duration_months := 12;
        END CASE;
      ELSE
        v_duration_months := 12;
    END CASE;

    -- حساب تاريخ الانتهاء
    v_expiry_date := v_start_date + (v_duration_months || ' months')::interval;

    -- التحقق من وجود سجل عضو (id في members = user_id في applications)
    SELECT id INTO v_existing_member_id
    FROM members
    WHERE id = NEW.user_id
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
        membership_type = NEW.membership_type,
        business_name = COALESCE(NEW.business_name, business_name),
        business_support_tier = COALESCE(NEW.business_support_tier, business_support_tier),
        custom_amount = COALESCE(NEW.custom_amount, custom_amount),
        payment_frequency = COALESCE(NEW.frequency, payment_frequency),
        start_date = v_start_date,
        expiry_date = v_expiry_date,
        status = 'active',
        updated_at = now()
      WHERE id = v_existing_member_id;

      RAISE NOTICE 'Updated existing member: %', v_existing_member_id;

    ELSE
      -- إنشاء سجل عضو جديد (id = user_id من auth)
      INSERT INTO members (
        id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        postcode,
        membership_type,
        business_name,
        business_support_tier,
        custom_amount,
        payment_frequency,
        start_date,
        expiry_date,
        status
      ) VALUES (
        NEW.user_id, -- استخدام user_id من application كـ id في members
        NEW.first_name,
        NEW.last_name,
        NEW.email,
        NEW.phone,
        NEW.date_of_birth,
        NEW.address,
        NEW.postcode,
        NEW.membership_type,
        NEW.business_name,
        NEW.business_support_tier,
        NEW.custom_amount,
        NEW.frequency,
        v_start_date,
        v_expiry_date,
        'active'
      );

      RAISE NOTICE 'Created new member for user: %', NEW.user_id;
    END IF;

    -- تحديث حالة الطلب
    UPDATE membership_applications
    SET status = 'approved'
    WHERE id = NEW.id;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إعادة إنشاء Trigger
DROP TRIGGER IF EXISTS trigger_auto_create_member_on_payment ON membership_applications;
CREATE TRIGGER trigger_auto_create_member_on_payment
  AFTER UPDATE OF payment_status ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_member_on_payment();

COMMENT ON FUNCTION auto_create_member_on_payment() IS
'تقوم هذه الدالة بإنشاء أو تحديث سجل العضو تلقائياً عند تحديث حالة الدفع إلى paid';
