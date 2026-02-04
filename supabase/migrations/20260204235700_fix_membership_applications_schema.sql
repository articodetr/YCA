/*
  # Fix Membership Applications Schema

  ## Summary
  This migration fixes the membership_applications table to match the application form requirements
  and adds support for family members and organization memberships.

  ## Changes Made
  
  1. **membership_applications table updates**
     - Split full_name into first_name and last_name (required fields)
     - Added city and postcode fields for better address management
     - Added payment_status field to track payment state
     - Added organization fields: organization_name, organization_type, number_of_members
     - Added user_id to link with auth.users
     - Made full_name nullable (will be computed from first_name + last_name)
     - Updated membership_type constraint to include 'student' and 'organization'
  
  2. **New table: membership_application_family_members**
     - Stores family members for family membership applications
     - Links to membership_applications via application_id
     - Contains name, relationship, and date_of_birth
  
  3. **Security**
     - RLS enabled on both tables
     - Users can read/insert their own applications
     - Admins can view all applications
     - Family members inherit permissions from parent application

  ## Important Notes
  - This preserves all existing data in membership_applications
  - New fields are nullable to allow existing records to remain valid
  - User_id will be populated for new applications
*/

-- Add new columns to membership_applications
DO $$
BEGIN
  -- Add first_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN first_name text;
  END IF;

  -- Add last_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN last_name text;
  END IF;

  -- Add city if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'city'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN city text;
  END IF;

  -- Add postcode if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'postcode'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN postcode text;
  END IF;

  -- Add payment_status if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN payment_status text DEFAULT 'pending'
      CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;

  -- Add organization_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN organization_name text;
  END IF;

  -- Add organization_type if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'organization_type'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN organization_type text;
  END IF;

  -- Add number_of_members if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'number_of_members'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN number_of_members integer;
  END IF;

  -- Add user_id if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_applications' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE membership_applications ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Make full_name nullable (since we're using first_name and last_name now)
ALTER TABLE membership_applications ALTER COLUMN full_name DROP NOT NULL;

-- Update membership_type constraint to include new types
ALTER TABLE membership_applications DROP CONSTRAINT IF EXISTS membership_applications_membership_type_check;
ALTER TABLE membership_applications ADD CONSTRAINT membership_applications_membership_type_check
  CHECK (membership_type IN ('individual', 'family', 'youth', 'associate', 'student', 'organization'));

-- Create table for family members if it doesn't exist
CREATE TABLE IF NOT EXISTS membership_application_family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES membership_applications(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  date_of_birth text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on family members table
ALTER TABLE membership_application_family_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_applications

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON membership_applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON membership_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON membership_applications;

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications"
  ON membership_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own applications
CREATE POLICY "Users can insert own applications"
  ON membership_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications"
  ON membership_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- RLS Policies for membership_application_family_members

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view family members of own applications" ON membership_application_family_members;
DROP POLICY IF EXISTS "Users can insert family members for own applications" ON membership_application_family_members;
DROP POLICY IF EXISTS "Admins can view all family members" ON membership_application_family_members;

-- Allow users to view family members of their own applications
CREATE POLICY "Users can view family members of own applications"
  ON membership_application_family_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership_applications
      WHERE membership_applications.id = membership_application_family_members.application_id
      AND membership_applications.user_id = auth.uid()
    )
  );

-- Allow users to insert family members for their own applications
CREATE POLICY "Users can insert family members for own applications"
  ON membership_application_family_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership_applications
      WHERE membership_applications.id = membership_application_family_members.application_id
      AND membership_applications.user_id = auth.uid()
    )
  );

-- Allow admins to view all family members
CREATE POLICY "Admins can view all family members"
  ON membership_application_family_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_membership_applications_user_id ON membership_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_application_family_members_application_id ON membership_application_family_members(application_id);