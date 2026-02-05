/*
  # Fix Wakala Applications Schema
  
  1. Changes
    - Update wakala_applications table to match frontend requirements
    - Add missing columns needed for the wakala service application form
    - Add date_of_birth, nationality, passport_number, requested_date, service_type, special_requests
    - Add payment_status column
    - Update column types to match form data
  
  2. Notes
    - The existing columns are kept for backwards compatibility
    - New columns are nullable to allow existing records to remain valid
*/

-- Add missing columns to wakala_applications table
DO $$
BEGIN
  -- Add date_of_birth column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN date_of_birth date;
  END IF;

  -- Add nationality column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'nationality'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN nationality text;
  END IF;

  -- Add passport_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'passport_number'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN passport_number text;
  END IF;

  -- Add requested_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'requested_date'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN requested_date date;
  END IF;

  -- Add service_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN service_type text;
  END IF;

  -- Add special_requests column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'special_requests'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN special_requests text;
  END IF;

  -- Add payment_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN payment_status text DEFAULT 'pending';
  END IF;

  -- Add full_name column (for easier frontend integration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN full_name text;
  END IF;

  -- Add phone column (for easier frontend integration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'phone'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN phone text;
  END IF;

  -- Add email column (for easier frontend integration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'email'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN email text;
  END IF;

  -- Add user_id column (to link to auth.users)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;

  -- Add passport_copies column (for multiple file paths)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wakala_applications' AND column_name = 'passport_copies'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN passport_copies text[];
  END IF;
END $$;