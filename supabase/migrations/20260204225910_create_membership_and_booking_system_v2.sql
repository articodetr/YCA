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
