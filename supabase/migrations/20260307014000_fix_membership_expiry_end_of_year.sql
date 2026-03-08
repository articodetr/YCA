/*
  # Fix membership expiry to always end on 31 December

  This migration:
  1. Updates the auto activation trigger so new paid/completed applications
     always create or update members with expiry_date = 31 December of the
     membership start year.
  2. Accepts both `paid` and `completed` payment statuses.
  3. Corrects existing members so their expiry date becomes 31 December of the
     year of start_date, or created_at/current_date when start_date is null.
*/

DROP FUNCTION IF EXISTS auto_create_member_on_payment() CASCADE;

CREATE OR REPLACE FUNCTION auto_create_member_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_start_date date;
  v_expiry_date date;
  v_existing_member_id uuid;
BEGIN
  IF NEW.payment_status IN ('paid', 'completed')
     AND COALESCE(OLD.payment_status, '') NOT IN ('paid', 'completed') THEN

    IF NEW.user_id IS NULL THEN
      RAISE NOTICE 'Cannot create member: user_id is NULL for application %', NEW.id;
      RETURN NEW;
    END IF;

    v_start_date := CURRENT_DATE;
    v_expiry_date := make_date(EXTRACT(YEAR FROM v_start_date)::int, 12, 31);

    SELECT id INTO v_existing_member_id
    FROM members
    WHERE id = NEW.user_id
    LIMIT 1;

    IF v_existing_member_id IS NOT NULL THEN
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
    ELSE
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
        NEW.user_id,
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
    END IF;

    UPDATE membership_applications
    SET status = 'approved'
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_create_member_on_payment ON membership_applications;

CREATE TRIGGER trigger_auto_create_member_on_payment
  AFTER UPDATE OF payment_status ON membership_applications
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_member_on_payment();

UPDATE members
SET
  expiry_date = make_date(
    EXTRACT(YEAR FROM COALESCE(start_date, created_at::date, CURRENT_DATE))::int,
    12,
    31
  ),
  updated_at = now()
WHERE expiry_date IS DISTINCT FROM make_date(
  EXTRACT(YEAR FROM COALESCE(start_date, created_at::date, CURRENT_DATE))::int,
  12,
  31
);

COMMENT ON FUNCTION auto_create_member_on_payment() IS
'Automatically creates or updates a member when membership payment is successful, with expiry fixed to 31 December of the membership year.';
