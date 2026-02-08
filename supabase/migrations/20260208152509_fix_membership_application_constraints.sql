/*
  # Fix Membership Application Constraints

  1. Changes
    - Add 'business_support' to membership_type check constraint on membership_applications
    - Add 'paid' to payment_status check constraint on membership_applications
    - These values are used in the application and webhook flows but were missing from constraints

  2. Important Notes
    - The membership_type constraint previously only allowed: individual, family, youth, associate, student, organization
    - The payment_status constraint previously only allowed: pending, completed, failed, refunded
    - The stripe webhook sets payment_status to 'paid', which needs to be a valid value
    - The 'business_support' membership type is used in the application form
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'membership_applications' 
    AND constraint_type = 'CHECK'
    AND constraint_name = 'membership_applications_membership_type_check'
  ) THEN
    ALTER TABLE membership_applications DROP CONSTRAINT membership_applications_membership_type_check;
  END IF;
END $$;

ALTER TABLE membership_applications ADD CONSTRAINT membership_applications_membership_type_check 
  CHECK (membership_type = ANY (ARRAY['individual'::text, 'family'::text, 'youth'::text, 'associate'::text, 'student'::text, 'organization'::text, 'business_support'::text]));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'membership_applications' 
    AND constraint_type = 'CHECK'
    AND constraint_name = 'membership_applications_payment_status_check'
  ) THEN
    ALTER TABLE membership_applications DROP CONSTRAINT membership_applications_payment_status_check;
  END IF;
END $$;

ALTER TABLE membership_applications ADD CONSTRAINT membership_applications_payment_status_check 
  CHECK (payment_status = ANY (ARRAY['pending'::text, 'completed'::text, 'paid'::text, 'failed'::text, 'refunded'::text]));
