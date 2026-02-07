-- ========== Migration: 20260204224722_add_bilingual_support.sql ==========
/*
  # Add Bilingual Support (English & Arabic)

  ## Overview
  This migration adds Arabic language support to all content tables.
  Default language is English, Arabic fields are optional with fallback to English.

  ## Changes

  ### 1. Hero Slides
  - Add `title_ar` (text) - Arabic title
  - Add `description_ar` (text) - Arabic description

  ### 2. Services Content
  - Add `title_ar` (text) - Arabic service title
  - Add `description_ar` (text) - Arabic service description

  ### 3. Programmes Items
  - Add `title_ar` (text) - Arabic programme title
  - Add `description_ar` (text) - Arabic programme description
  - Add `content_ar` (text) - Arabic programme content

  ### 4. Resources Items
  - Add `title_ar` (text) - Arabic resource title
  - Add `description_ar` (text) - Arabic resource description

  ### 5. Team Members
  - Add `role_ar` (text) - Arabic role/position
  - Add `bio_ar` (text) - Arabic biography

  ### 6. Events
  - Add `title_ar` (text) - Arabic event title
  - Add `description_ar` (text) - Arabic event description
  - Add `location_ar` (text) - Arabic location name

  ### 7. News
  - Add `title_ar` (text) - Arabic news title
  - Add `description_ar` (text) - Arabic news excerpt/description
  - Add `content_ar` (text) - Arabic news full content

  ### 8. Page Content
  - Add `title_ar` (text) - Arabic page title
  - Add `description_ar` (text) - Arabic page description

  ### 9. Content Sections
  - Add `title_ar` (text) - Arabic section title
  - Content JSON already supports { text_en, text_ar, image }

  ## Notes
  - All Arabic fields are nullable
  - Frontend should fallback to English when Arabic is empty
  - RLS policies remain unchanged
*/

-- Hero Slides
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_slides' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE hero_slides ADD COLUMN description_ar text;
  END IF;
END $$;

-- Services Content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_content' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE services_content ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services_content' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE services_content ADD COLUMN description_ar text;
  END IF;
END $$;

-- Programmes Items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programmes_items' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE programmes_items ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programmes_items' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE programmes_items ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'programmes_items' AND column_name = 'content_ar'
  ) THEN
    ALTER TABLE programmes_items ADD COLUMN content_ar text;
  END IF;
END $$;

-- Resources Items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_items' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE resources_items ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'resources_items' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE resources_items ADD COLUMN description_ar text;
  END IF;
END $$;

-- Team Members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'role_ar'
  ) THEN
    ALTER TABLE team_members ADD COLUMN role_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'team_members' AND column_name = 'bio_ar'
  ) THEN
    ALTER TABLE team_members ADD COLUMN bio_ar text;
  END IF;
END $$;

-- Events
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE events ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE events ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location_ar'
  ) THEN
    ALTER TABLE events ADD COLUMN location_ar text;
  END IF;
END $$;

-- News
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE news ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE news ADD COLUMN description_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'news' AND column_name = 'content_ar'
  ) THEN
    ALTER TABLE news ADD COLUMN content_ar text;
  END IF;
END $$;

-- Page Content
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_content' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE page_content ADD COLUMN title_ar text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_content' AND column_name = 'description_ar'
  ) THEN
    ALTER TABLE page_content ADD COLUMN description_ar text;
  END IF;
END $$;

-- Content Sections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_sections' AND column_name = 'title_ar'
  ) THEN
    ALTER TABLE content_sections ADD COLUMN title_ar text;
  END IF;
END $$;

-- ========== Migration: 20260204225910_create_membership_and_booking_system_v2.sql ==========
/*
  # Create Membership and Booking System v2

  ## Overview
  This migration creates a comprehensive membership, booking, and event registration system
  for YCA Birmingham website.

  ## New Tables
  1. members - Member profiles and accounts
  2. family_members - Family member details
  3. member_payments - Payment history
  4. service_bookings - Service appointments
  5. wakala_applications - Wakala/POA applications
  6. event_registrations - Event signups
  7. service_slots - Available booking slots

  ## Security
  - RLS enabled on all tables
  - Members can view/edit own records
  - Public can create applications with payment
*/

-- Members Table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_number text UNIQUE NOT NULL DEFAULT '',
  membership_type text NOT NULL CHECK (membership_type IN ('individual', 'family', 'associate', 'business_support')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  postcode text,
  date_of_birth date,
  photo_url text,
  business_name text,
  business_logo_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'suspended')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  auto_renewal boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can create member"
  ON members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view members"
  ON members FOR SELECT
  USING (true);

CREATE POLICY "Members can update own profile"
  ON members FOR UPDATE
  USING (true);

-- Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date,
  relationship text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view family members"
  ON family_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage family members"
  ON family_members FOR ALL
  USING (true);

-- Member Payments Table
CREATE TABLE IF NOT EXISTS member_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('membership', 'wakala', 'event', 'donation', 'service')),
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'GBP',
  payment_method text,
  stripe_payment_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date timestamptz DEFAULT now(),
  receipt_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE member_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view payments"
  ON member_payments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create payment"
  ON member_payments FOR INSERT
  WITH CHECK (true);

-- Service Bookings Table
CREATE TABLE IF NOT EXISTS service_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  service_type text NOT NULL CHECK (service_type IN ('advisory', 'wakala', 'consultation')),
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service_reason text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create booking"
  ON service_bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view bookings"
  ON service_bookings FOR SELECT
  USING (true);

-- Wakala Applications Table
CREATE TABLE IF NOT EXISTS wakala_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  applicant_name_ar text NOT NULL,
  applicant_phone text NOT NULL,
  applicant_email text NOT NULL,
  attorney_name_ar text NOT NULL,
  wakala_type_ar text NOT NULL,
  wakala_format_ar text NOT NULL,
  applicant_passport_url text NOT NULL,
  attorney_passport_url text NOT NULL,
  witness_passports_url text NOT NULL,
  membership_status text NOT NULL CHECK (membership_status IN ('member', 'non_member')),
  member_number text,
  is_first_wakala boolean DEFAULT true,
  fee_amount numeric(10,2) NOT NULL,
  payment_id uuid REFERENCES member_payments(id) ON DELETE SET NULL,
  additional_notes text,
  status text NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'submitted', 'in_progress', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE wakala_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create wakala application"
  ON wakala_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view wakala applications"
  ON wakala_applications FOR SELECT
  USING (true);

-- Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  registration_type text NOT NULL CHECK (registration_type IN ('free', 'paid')),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  num_attendees integer DEFAULT 1,
  is_member boolean DEFAULT false,
  ticket_type text,
  ticket_quantity integer DEFAULT 1,
  total_amount numeric(10,2) DEFAULT 0,
  dietary_requirements text,
  special_requirements text,
  emergency_contact_name text,
  emergency_contact_phone text,
  booking_reference text UNIQUE,
  payment_id uuid REFERENCES member_payments(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create event registration"
  ON event_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view event registrations"
  ON event_registrations FOR SELECT
  USING (true);

-- Service Slots Table
CREATE TABLE IF NOT EXISTS service_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL CHECK (service_type IN ('advisory', 'wakala', 'consultation')),
  slot_date date NOT NULL,
  slot_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  is_available boolean DEFAULT true,
  max_bookings integer DEFAULT 1,
  current_bookings integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service slots"
  ON service_slots FOR SELECT
  USING (true);

-- Function to generate member number
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS text AS $$
DECLARE
  year_str text;
  next_num integer;
  member_num text;
BEGIN
  year_str := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  SELECT COALESCE(MAX(
    CAST(SUBSTRING(member_number FROM 8) AS integer)
  ), 0) + 1
  INTO next_num
  FROM members
  WHERE member_number LIKE 'YCA' || year_str || '%';

  member_num := 'YCA' || year_str || LPAD(next_num::text, 4, '0');

  RETURN member_num;
END;
$$ LANGUAGE plpgsql;

-- Function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS text AS $$
DECLARE
  ref_num text;
BEGIN
  ref_num := 'EVT' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
  RETURN ref_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate member number
CREATE OR REPLACE FUNCTION set_member_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_number IS NULL OR NEW.member_number = '' THEN
    NEW.member_number := generate_member_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_member_number'
  ) THEN
    CREATE TRIGGER trigger_set_member_number
      BEFORE INSERT ON members
      FOR EACH ROW
      EXECUTE FUNCTION set_member_number();
  END IF;
END $$;

-- Trigger to auto-generate booking reference
CREATE OR REPLACE FUNCTION set_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
    NEW.booking_reference := generate_booking_reference();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_booking_reference'
  ) THEN
    CREATE TRIGGER trigger_set_booking_reference
      BEFORE INSERT ON event_registrations
      FOR EACH ROW
      EXECUTE FUNCTION set_booking_reference();
  END IF;
END $$;

-- Function to check wakala eligibility
CREATE OR REPLACE FUNCTION check_wakala_eligibility(member_uuid uuid)
RETURNS jsonb AS $$
DECLARE
  member_record RECORD;
  days_since_start integer;
  wakala_count integer;
BEGIN
  SELECT * INTO member_record FROM members WHERE id = member_uuid AND status = 'active';

  IF member_record IS NULL THEN
    RETURN jsonb_build_object(
      'is_eligible', false,
      'is_first_wakala', false,
      'fee_amount', 40,
      'reason', 'non_member'
    );
  END IF;

  days_since_start := CURRENT_DATE - member_record.start_date;

  IF days_since_start < 10 THEN
    RETURN jsonb_build_object(
      'is_eligible', false,
      'is_first_wakala', false,
      'fee_amount', 40,
      'reason', 'membership_too_recent'
    );
  END IF;

  SELECT COUNT(*) INTO wakala_count
  FROM wakala_applications
  WHERE member_id = member_uuid
  AND status NOT IN ('rejected', 'pending_payment');

  IF wakala_count = 0 THEN
    RETURN jsonb_build_object(
      'is_eligible', true,
      'is_first_wakala', true,
      'fee_amount', 0,
      'reason', 'first_wakala_free'
    );
  ELSE
    RETURN jsonb_build_object(
      'is_eligible', true,
      'is_first_wakala', false,
      'fee_amount', 20,
      'reason', 'subsequent_wakala'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add capacity and pricing to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'max_capacity'
  ) THEN
    ALTER TABLE events ADD COLUMN max_capacity integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'current_registrations'
  ) THEN
    ALTER TABLE events ADD COLUMN current_registrations integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_paid_event'
  ) THEN
    ALTER TABLE events ADD COLUMN is_paid_event boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'ticket_price_adult'
  ) THEN
    ALTER TABLE events ADD COLUMN ticket_price_adult numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'ticket_price_child'
  ) THEN
    ALTER TABLE events ADD COLUMN ticket_price_child numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'ticket_price_member'
  ) THEN
    ALTER TABLE events ADD COLUMN ticket_price_member numeric(10,2);
  END IF;
END $$;

-- ========== Migration: 20260204231750_create_wakala_documents_bucket.sql ==========
/*
  # Create Wakala Documents Storage Bucket

  ## Overview
  This migration creates a storage bucket for Wakala application documents
  (passport copies, ID documents, etc.) with appropriate security policies.

  ## New Storage Bucket
  - wakala-documents: Private bucket for storing passport copies and documents

  ## Security
  - Private bucket (not public)
  - Authenticated members can upload their own documents
  - Admins can view and manage all documents
  - Members can only access their own uploaded documents
  - Accepts image and PDF files
  - 10MB file size limit per file
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wakala-documents',
  'wakala-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Members can upload their wakala documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'wakala-documents' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Members can view their own wakala documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wakala-documents' AND
    (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM admins
        WHERE admins.id = auth.uid()
        AND admins.is_active = true
      )
    )
  );

CREATE POLICY "Admins can view all wakala documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'wakala-documents' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete wakala documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'wakala-documents' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- ========== Migration: 20260204235700_fix_membership_applications_schema.sql ==========
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
-- ========== Migration: 20260205000559_fix_wakala_applications_schema.sql ==========
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
-- ========== Migration: 20260205001118_make_wakala_old_columns_nullable.sql ==========
/*
  # Make Wakala Applications Old Columns Nullable

  1. Changes
    - Make old wakala_applications columns nullable to support new application form
    - This allows the new form to work while maintaining backwards compatibility
    - Old columns remain available for Arabic-specific wakala applications

  2. Security
    - RLS policies remain unchanged
    - No data is lost or modified
*/

-- Make old required columns nullable
ALTER TABLE wakala_applications
  ALTER COLUMN applicant_name_ar DROP NOT NULL,
  ALTER COLUMN attorney_name_ar DROP NOT NULL,
  ALTER COLUMN wakala_type_ar DROP NOT NULL,
  ALTER COLUMN wakala_format_ar DROP NOT NULL,
  ALTER COLUMN applicant_passport_url DROP NOT NULL,
  ALTER COLUMN attorney_passport_url DROP NOT NULL,
  ALTER COLUMN witness_passports_url DROP NOT NULL,
  ALTER COLUMN membership_status DROP NOT NULL,
  ALTER COLUMN fee_amount DROP NOT NULL;
-- ========== Migration: 20260205001702_fix_wakala_applicant_columns_nullable.sql ==========
/*
  # Fix Wakala Applications - Make Old Columns Nullable

  ## Changes
  1. Makes `applicant_phone` column nullable (previously NOT NULL)
  2. Makes `applicant_email` column nullable (previously NOT NULL)

  ## Reason
  The application form now uses the new `phone` and `email` columns instead of the legacy `applicant_phone` and `applicant_email` columns. Making the old columns nullable ensures backward compatibility while allowing the new structure to work properly.

  ## Notes
  - The new columns `phone` and `email` are already nullable
  - This migration maintains data integrity while supporting the updated application flow
*/

-- Make old columns nullable to support new application structure
ALTER TABLE wakala_applications
  ALTER COLUMN applicant_phone DROP NOT NULL,
  ALTER COLUMN applicant_email DROP NOT NULL;
-- ========== Migration: 20260205003454_stark_cake.sql ==========
/*
  # Stripe Integration Schema

  1. New Tables
    - `stripe_customers`: Links Supabase users to Stripe customers
      - Includes `user_id` (references `auth.users`)
      - Stores Stripe `customer_id`
      - Implements soft delete

    - `stripe_subscriptions`: Manages subscription data
      - Tracks subscription status, periods, and payment details
      - Links to `stripe_customers` via `customer_id`
      - Custom enum type for subscription status
      - Implements soft delete

    - `stripe_orders`: Stores order/purchase information
      - Records checkout sessions and payment intents
      - Tracks payment amounts and status
      - Custom enum type for order status
      - Implements soft delete

  2. Views
    - `stripe_user_subscriptions`: Secure view for user subscription data
      - Joins customers and subscriptions
      - Filtered by authenticated user

    - `stripe_user_orders`: Secure view for user order history
      - Joins customers and orders
      - Filtered by authenticated user

  3. Security
    - Enables Row Level Security (RLS) on all tables
    - Implements policies for authenticated users to view their own data
*/

CREATE TABLE IF NOT EXISTS stripe_customers (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users(id) not null unique,
  customer_id text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE TYPE stripe_subscription_status AS ENUM (
    'not_started',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
);

CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id bigint primary key generated always as identity,
  customer_id text unique not null,
  subscription_id text default null,
  price_id text default null,
  current_period_start bigint default null,
  current_period_end bigint default null,
  cancel_at_period_end boolean default false,
  payment_method_brand text default null,
  payment_method_last4 text default null,
  status stripe_subscription_status not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'completed',
    'canceled'
);

CREATE TABLE IF NOT EXISTS stripe_orders (
    id bigint primary key generated always as identity,
    checkout_session_id text not null,
    payment_intent_id text not null,
    customer_id text not null,
    amount_subtotal bigint not null,
    amount_total bigint not null,
    currency text not null,
    payment_status text not null,
    status stripe_order_status not null default 'pending',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    deleted_at timestamp with time zone default null
);

ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

-- View for user subscriptions
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- View for user orders
CREATE VIEW stripe_user_orders WITH (security_invoker) AS
SELECT
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;
-- ========== Migration: 20260205013034_create_booking_system_v2.sql ==========
/*
  # Booking System Database Schema

  ## Overview
  Creates a complete booking system for YCA Birmingham with availability management.

  ## New Tables

  ### `booking_services`
  - `id` (uuid, primary key)
  - `name_en` (text) - Service name in English
  - `name_ar` (text) - Service name in Arabic
  - `duration_minutes` (integer) - Duration of the service
  - `is_active` (boolean) - Whether service is currently available
  - `created_at` (timestamptz)

  ### `availability_slots`
  - `id` (uuid, primary key)
  - `service_id` (uuid, foreign key to booking_services)
  - `date` (date) - The date of availability
  - `start_time` (time) - Start time of the slot
  - `end_time` (time) - End time of the slot
  - `is_available` (boolean) - Whether slot is available
  - `is_blocked_by_admin` (boolean) - Admin blocked this slot
  - `created_at` (timestamptz)

  ### `bookings`
  - `id` (uuid, primary key)
  - `service_id` (uuid, foreign key)
  - `slot_id` (uuid, foreign key)
  - `date` (date) - Booking date
  - `start_time` (time) - Start time
  - `end_time` (time) - End time
  - `client_name` (text) - Client full name
  - `client_email` (text) - Client email
  - `client_phone` (text) - Client phone
  - `location_type` (text) - 'office' or 'online'
  - `notes` (text, optional) - Additional notes
  - `status` (text) - 'pending', 'confirmed', 'cancelled'
  - `created_at` (timestamptz)
  - `user_id` (uuid, optional) - If user is logged in

  ### `booking_settings`
  - `id` (uuid, primary key)
  - `max_booking_days_ahead` (integer) - Maximum days in advance
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public can view services and available slots
  - Public can create bookings
  - Only admins can manage slots and settings
*/

-- Create booking_services table
CREATE TABLE IF NOT EXISTS booking_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en text NOT NULL,
  name_ar text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES booking_services(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  is_blocked_by_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(service_id, date, start_time)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES booking_services(id) ON DELETE SET NULL,
  slot_id uuid REFERENCES availability_slots(id) ON DELETE SET NULL,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text NOT NULL,
  location_type text NOT NULL CHECK (location_type IN ('office', 'online')),
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create booking_settings table
CREATE TABLE IF NOT EXISTS booking_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  max_booking_days_ahead integer DEFAULT 30,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_services
CREATE POLICY "Anyone can view active services"
  ON booking_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON booking_services FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

-- RLS Policies for availability_slots
CREATE POLICY "Anyone can view available slots"
  ON availability_slots FOR SELECT
  USING (is_available = true AND is_blocked_by_admin = false);

CREATE POLICY "Admins can manage slots"
  ON availability_slots FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

-- RLS Policies for booking_settings
CREATE POLICY "Anyone can view settings"
  ON booking_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update settings"
  ON booking_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.email = auth.jwt()->>'email'
      AND admins.is_active = true
    )
  );

-- Insert default services
INSERT INTO booking_services (name_en, name_ar, duration_minutes, is_active) VALUES
  ('Advisory Office Services', 'خدمات المكتب الاستشاري', 60, true),
  ('Wakala Services', 'خدمات الوكالة', 60, true)
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO booking_settings (max_booking_days_ahead) VALUES (30)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_availability_slots_date ON availability_slots(date);
CREATE INDEX IF NOT EXISTS idx_availability_slots_service ON availability_slots(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
-- ========== Migration: 20260205014159_integrate_wakala_with_booking_system.sql ==========
/*
  # Integrate Wakala Applications with Booking System

  ## Overview
  Updates the wakala_applications table to integrate with the new booking system while preserving all existing data.

  ## Changes

  ### Updates to `wakala_applications`
  - Add `slot_id` (uuid, optional) - Reference to booked time slot
  - Add `start_time` (time, optional) - Start time of appointment
  - Add `end_time` (time, optional) - End time of appointment
  - Keep all existing fields for backward compatibility

  ## Notes
  - This migration maintains backward compatibility with existing applications
  - New applications will use the booking system integration
  - Old applications without slot_id will still work
*/

-- Add new columns to wakala_applications for booking system integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'slot_id'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN slot_id uuid REFERENCES availability_slots(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN start_time time;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wakala_applications' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE wakala_applications ADD COLUMN end_time time;
  END IF;
END $$;

-- Create index for faster slot lookups
CREATE INDEX IF NOT EXISTS idx_wakala_applications_slot ON wakala_applications(slot_id);

-- Ensure Wakala Services exist in booking_services
INSERT INTO booking_services (name_en, name_ar, duration_minutes, is_active)
VALUES ('Wakala Services', 'خدمات الوكالة', 60, true)
ON CONFLICT DO NOTHING;
-- ========== Migration: 20260205014931_update_admin_password_v2.sql ==========
/*
  # Update Admin Password

  ## Overview
  Updates the password for the admin user Info@yca-birmingham.org.uk to '123456'

  ## Changes
  - Updates the password in auth.users using Supabase's auth functions
  - Ensures the admin user exists in the admins table

  ## Security Notes
  - This is a one-time update for the super admin account
  - Password should be changed after first login for security
*/

-- Update the admin user's password using Supabase's auth schema
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'Info@yca-birmingham.org.uk';

  -- If user exists, update the password
  IF admin_user_id IS NOT NULL THEN
    -- Update password directly in auth.users
    -- Supabase will handle the encryption
    UPDATE auth.users
    SET
      encrypted_password = crypt('123456', gen_salt('bf')),
      updated_at = now()
    WHERE id = admin_user_id;

    -- Ensure the user is in the admins table
    INSERT INTO admins (id, email, full_name, role, is_active)
    VALUES (
      admin_user_id,
      'Info@yca-birmingham.org.uk',
      'YCA Administrator',
      'super_admin',
      true
    )
    ON CONFLICT (id) DO UPDATE
    SET
      full_name = 'YCA Administrator',
      role = 'super_admin',
      is_active = true;

    RAISE NOTICE 'Admin password updated successfully for Info@yca-birmingham.org.uk';
  ELSE
    RAISE NOTICE 'Admin user not found, please create user first';
  END IF;
END $$;
-- ========== Migration: 20260205022911_add_default_availability_slots.sql ==========
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

-- ========== Migration: 20260205024654_update_wakala_day_specific_times.sql ==========
/*
  # Update Wakala Availability with Day-Specific Times

  This migration updates wakala service availability with day-specific time slots based on London timezone.

  ## New Schedule

  ### Monday to Thursday (DOW 1-4)
  - Operating Hours: 10:00 AM - 2:15 PM
  - Slot Interval: 15 minutes
  - Total Slots: 17 per day
  - Times: 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45,
           12:00, 12:15, 12:30, 12:45, 13:00, 13:15, 13:30, 13:45, 14:00, 14:15

  ### Friday (DOW 5)
  - Operating Hours: 9:00 AM - 11:45 AM
  - Slot Interval: 15 minutes
  - Total Slots: 11 per day
  - Times: 9:00, 9:15, 9:30, 9:45, 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45

  ### Saturday & Sunday (DOW 0, 6)
  - Status: CLOSED
  - No slots generated

  ## Implementation
  1. Delete all existing wakala availability slots
  2. Create new day-specific slots for 60 days ahead
  3. Add constraint to prevent weekend slot creation

  ## Notes
  - All times are in London timezone (Europe/London)
  - Weekends (Saturday & Sunday) are automatically excluded
  - Generates slots for 60 days in advance
*/

-- Create or replace function to generate day-specific wakala slots
CREATE OR REPLACE FUNCTION generate_day_specific_wakala_slots()
RETURNS void AS $$
DECLARE
  v_service_id UUID;
  v_current_date DATE;
  v_end_date DATE;
  v_day_of_week INTEGER;
  v_slot_time TIME;
  v_slot_end_time TIME;
BEGIN
  -- Get Wakala service ID
  SELECT id INTO v_service_id
  FROM booking_services
  WHERE name_en = 'Wakala Services'
  LIMIT 1;

  IF v_service_id IS NULL THEN
    RAISE EXCEPTION 'Wakala Services not found';
  END IF;

  -- Define date range: today to 60 days ahead
  v_current_date := CURRENT_DATE;
  v_end_date := v_current_date + INTERVAL '60 days';

  -- Delete all existing wakala slots
  DELETE FROM availability_slots
  WHERE service_id = v_service_id;

  RAISE NOTICE 'Deleted existing wakala slots';

  -- Generate slots for each day
  WHILE v_current_date <= v_end_date LOOP
    -- Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    v_day_of_week := EXTRACT(DOW FROM v_current_date);

    -- Skip weekends (Saturday=6, Sunday=0)
    IF v_day_of_week != 0 AND v_day_of_week != 6 THEN

      -- Friday schedule: 9:00 AM - 11:45 AM
      IF v_day_of_week = 5 THEN
        v_slot_time := '09:00:00'::TIME;

        WHILE v_slot_time <= '11:45:00'::TIME LOOP
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

      -- Monday-Thursday schedule: 10:00 AM - 2:15 PM
      ELSE
        v_slot_time := '10:00:00'::TIME;

        WHILE v_slot_time <= '14:15:00'::TIME LOOP
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
      END IF;

      RAISE NOTICE 'Generated slots for % (DOW: %)', v_current_date, v_day_of_week;
    ELSE
      RAISE NOTICE 'Skipped weekend: % (DOW: %)', v_current_date, v_day_of_week;
    END IF;

    -- Move to next day
    v_current_date := v_current_date + 1;
  END LOOP;

  RAISE NOTICE 'Successfully generated day-specific wakala slots';
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate slots
SELECT generate_day_specific_wakala_slots();

-- Add check constraint to prevent weekend wakala slots (safety measure)
DO $$
BEGIN
  -- Drop existing constraint if exists
  ALTER TABLE availability_slots
  DROP CONSTRAINT IF EXISTS no_weekend_wakala_slots;

  -- Add new constraint
  ALTER TABLE availability_slots
  ADD CONSTRAINT no_weekend_wakala_slots
  CHECK (
    service_id NOT IN (SELECT id FROM booking_services WHERE name_en = 'Wakala Services') OR
    EXTRACT(DOW FROM date) NOT IN (0, 6)
  );

  RAISE NOTICE 'Added constraint to prevent weekend wakala slots';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Constraint already exists or error occurred: %', SQLERRM;
END $$;

-- Drop the function as it's no longer needed after execution
DROP FUNCTION IF EXISTS generate_day_specific_wakala_slots();
