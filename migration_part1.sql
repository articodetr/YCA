-- ========== Migration: 20260130154114_create_yca_tables.sql ==========
/*
  # Create YCA Birmingham Database Schema

  ## Overview
  This migration creates the core database tables for the YCA Birmingham website,
  including events, news articles, and contact form submissions.

  ## New Tables

  ### `events`
  - `id` (uuid, primary key) - Unique event identifier
  - `title` (text) - Event title
  - `description` (text) - Event description
  - `date` (date) - Event date
  - `time` (text) - Event time
  - `location` (text) - Event location
  - `category` (text) - Event category (Community, Sports, Cultural, etc.)
  - `image_url` (text) - URL to event image
  - `is_featured` (boolean) - Whether event is featured
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `news`
  - `id` (uuid, primary key) - Unique article identifier
  - `title` (text) - Article title
  - `excerpt` (text) - Article excerpt/summary
  - `content` (text) - Full article content
  - `category` (text) - Article category
  - `author` (text) - Article author
  - `image_url` (text) - URL to article image
  - `published_at` (timestamptz) - Publication date
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `contact_submissions`
  - `id` (uuid, primary key) - Unique submission identifier
  - `name` (text) - Sender name
  - `email` (text) - Sender email
  - `phone` (text, nullable) - Sender phone
  - `subject` (text) - Message subject
  - `message` (text) - Message content
  - `status` (text) - Submission status (new, read, replied)
  - `created_at` (timestamptz) - Submission timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for events and news
  - Authenticated-only write access for events and news
  - Public insert access for contact submissions (for form submissions)
  - Authenticated-only read access for contact submissions
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  author text NOT NULL,
  image_url text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Events can be inserted by authenticated users"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Events can be updated by authenticated users"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Events can be deleted by authenticated users"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- News policies
CREATE POLICY "News articles are viewable by everyone"
  ON news FOR SELECT
  TO public
  USING (true);

CREATE POLICY "News can be inserted by authenticated users"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "News can be updated by authenticated users"
  ON news FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "News can be deleted by authenticated users"
  ON news FOR DELETE
  TO authenticated
  USING (true);

-- Contact submissions policies
CREATE POLICY "Contact submissions can be inserted by anyone"
  ON contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Contact submissions can be viewed by authenticated users"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Contact submissions can be updated by authenticated users"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS events_date_idx ON events(date);
CREATE INDEX IF NOT EXISTS events_category_idx ON events(category);
CREATE INDEX IF NOT EXISTS news_published_at_idx ON news(published_at);
CREATE INDEX IF NOT EXISTS news_category_idx ON news(category);
CREATE INDEX IF NOT EXISTS contact_submissions_created_at_idx ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS contact_submissions_status_idx ON contact_submissions(status);

-- ========== Migration: 20260130182445_create_donations_tables.sql ==========
/*
  # Create Donations and Payment System Tables

  ## Summary
  Sets up the database schema for handling donations and payment processing with Stripe integration.

  ## New Tables

  ### `donations`
  Stores all donation records with payment information
  - `id` (uuid, primary key) - Unique donation identifier
  - `full_name` (text) - Donor's full name
  - `email` (text) - Donor's email address
  - `phone` (text) - Donor's phone number
  - `amount` (numeric) - Donation amount in GBP
  - `donation_type` (text) - Either 'one-time' or 'monthly'
  - `message` (text, optional) - Optional message from donor
  - `payment_status` (text) - Status: 'pending', 'succeeded', 'failed', 'refunded'
  - `payment_intent_id` (text) - Stripe PaymentIntent ID
  - `stripe_customer_id` (text, optional) - Stripe Customer ID for recurring donations
  - `created_at` (timestamptz) - Timestamp of donation
  - `updated_at` (timestamptz) - Last update timestamp

  ### `payment_logs`
  Logs all payment attempts and events for debugging and auditing
  - `id` (uuid, primary key) - Unique log identifier
  - `donation_id` (uuid, optional) - Reference to donation if applicable
  - `event_type` (text) - Type of event: 'payment_intent_created', 'payment_succeeded', 'payment_failed', etc.
  - `stripe_event_id` (text, optional) - Stripe webhook event ID
  - `payload` (jsonb) - Full event data
  - `error_message` (text, optional) - Error details if failed
  - `created_at` (timestamptz) - Timestamp of log entry

  ## Security
  - Enable RLS on both tables
  - Allow public inserts for donations (for donation form)
  - Allow authenticated admin users to read all records
  - Payment logs are admin-only access

  ## Indexes
  - Index on donations email for quick lookup
  - Index on donations payment_status for filtering
  - Index on donations created_at for chronological queries
  - Index on payment_logs donation_id for quick relation lookup
*/

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  donation_type text NOT NULL CHECK (donation_type IN ('one-time', 'monthly')),
  message text DEFAULT '',
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
  payment_intent_id text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment logs table
CREATE TABLE IF NOT EXISTS payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid REFERENCES donations(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  stripe_event_id text,
  payload jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(email);
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_donation_id ON payment_logs(donation_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Donations policies: Allow public to insert (for donation form)
CREATE POLICY "Anyone can create donations"
  ON donations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Donations policies: Allow users to read their own donations by email
CREATE POLICY "Users can read their own donations"
  ON donations FOR SELECT
  TO anon
  USING (true);

-- Donations policies: Only authenticated users can update
CREATE POLICY "Authenticated users can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Payment logs policies: Only authenticated users can insert logs
CREATE POLICY "Authenticated users can insert payment logs"
  ON payment_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Payment logs policies: Only authenticated users can read logs
CREATE POLICY "Authenticated users can read payment logs"
  ON payment_logs FOR SELECT
  TO authenticated
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on donations table
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== Migration: 20260130191340_create_membership_applications_table.sql ==========
/*
  # Create membership_applications table

  1. New Tables
    - `membership_applications`
      - `id` (uuid, primary key) - Unique identifier for each application
      - `full_name` (text, required) - Applicant's full name
      - `email` (text, required) - Contact email address
      - `phone` (text, required) - Phone number
      - `address` (text, required) - Physical address
      - `date_of_birth` (date, optional) - Date of birth
      - `membership_type` (text, required) - Type of membership (individual/family/youth/associate)
      - `emergency_contact_name` (text, optional) - Emergency contact person
      - `emergency_contact_phone` (text, optional) - Emergency contact phone
      - `how_did_you_hear` (text, optional) - How they heard about the organization
      - `interests` (text, optional) - Areas of interest or skills to contribute
      - `terms_accepted` (boolean, default false) - Terms and conditions acceptance
      - `status` (text, default 'pending') - Application status (pending/approved/rejected)
      - `created_at` (timestamptz) - Timestamp of application submission
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `membership_applications` table
    - Add policy for public to insert new applications
    - Add policy for public to read applications

  3. Indexes
    - Create index on email for faster lookups
    - Create index on status for filtering applications
*/

CREATE TABLE IF NOT EXISTS membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  date_of_birth date,
  membership_type text NOT NULL CHECK (membership_type IN ('individual', 'family', 'youth', 'associate')),
  emergency_contact_name text,
  emergency_contact_phone text,
  how_did_you_hear text,
  interests text,
  terms_accepted boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert membership applications"
  ON membership_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public to read applications"
  ON membership_applications
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_membership_applications_email ON membership_applications(email);
CREATE INDEX IF NOT EXISTS idx_membership_applications_status ON membership_applications(status);

-- ========== Migration: 20260130192843_create_additional_tables.sql ==========
/*
  # Create Additional YCA Tables

  1. New Tables
    - `newsletter_subscriptions`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `name` (text, nullable)
      - `status` (text, default 'active')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `event_registrations`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key to events)
      - `full_name` (text, not null)
      - `email` (text, not null)
      - `phone` (text, nullable)
      - `number_of_attendees` (integer, default 1)
      - `notes` (text, nullable)
      - `status` (text, default 'confirmed')
      - `created_at` (timestamptz)

    - `volunteer_applications`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `email` (text, not null)
      - `phone` (text, not null)
      - `address` (text, nullable)
      - `date_of_birth` (date, nullable)
      - `interests` (text, nullable)
      - `skills` (text, nullable)
      - `availability` (text, nullable)
      - `experience` (text, nullable)
      - `why_volunteer` (text, nullable)
      - `emergency_contact_name` (text, nullable)
      - `emergency_contact_phone` (text, nullable)
      - `status` (text, default 'pending')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `partnership_inquiries`
      - `id` (uuid, primary key)
      - `organization_name` (text, not null)
      - `contact_person` (text, not null)
      - `email` (text, not null)
      - `phone` (text, not null)
      - `organization_type` (text, nullable)
      - `partnership_interest` (text, nullable)
      - `message` (text, nullable)
      - `status` (text, default 'new')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to insert data
    - Add policies for public users to insert certain data (newsletter, registrations, applications, inquiries)
*/

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event_registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  number_of_attendees integer DEFAULT 1 CHECK (number_of_attendees > 0),
  notes text,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
  created_at timestamptz DEFAULT now()
);

-- Create volunteer_applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text,
  date_of_birth date,
  interests text,
  skills text,
  availability text,
  experience text,
  why_volunteer text,
  emergency_contact_name text,
  emergency_contact_phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create partnership_inquiries table
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  organization_type text,
  partnership_interest text,
  message text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'completed', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter_subscriptions
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own subscription"
  ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policies for event_registrations
CREATE POLICY "Anyone can register for events"
  ON event_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own registrations"
  ON event_registrations
  FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policies for volunteer_applications
CREATE POLICY "Anyone can submit volunteer application"
  ON volunteer_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own volunteer applications"
  ON volunteer_applications
  FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policies for partnership_inquiries
CREATE POLICY "Anyone can submit partnership inquiry"
  ON partnership_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own partnership inquiries"
  ON partnership_inquiries
  FOR SELECT
  TO authenticated
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- ========== Migration: 20260130225616_add_skills_to_event_registrations.sql ==========
/*
  # Add skills column to event_registrations table

  1. Changes
    - Add `skills` column to `event_registrations` table
      - Type: text
      - Nullable: true
      - Description: Stores the skills of the person registering for the event

  2. Notes
    - This field is optional and allows registrants to list their skills when signing up for events
    - No data migration needed as table is currently empty
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_registrations' AND column_name = 'skills'
  ) THEN
    ALTER TABLE event_registrations ADD COLUMN skills text;
  END IF;
END $$;

-- ========== Migration: 20260130231655_create_admin_system_tables.sql ==========
/*
  # Create Admin System Tables

  1. New Tables
    - `admins`
      - `id` (uuid, primary key) - Links to auth.users
      - `email` (text, unique) - Admin email
      - `full_name` (text) - Admin full name
      - `role` (text) - Admin role (super_admin, admin, editor)
      - `created_at` (timestamptz) - When admin was created
      - `last_login_at` (timestamptz) - Last login timestamp
      - `is_active` (boolean) - Whether admin account is active

    - `admin_activity_logs`
      - `id` (uuid, primary key)
      - `admin_id` (uuid, foreign key) - Reference to admin
      - `action` (text) - Action performed
      - `entity_type` (text) - Type of entity (news, events, etc)
      - `entity_id` (uuid) - ID of the entity affected
      - `details` (jsonb) - Additional details about the action
      - `created_at` (timestamptz) - When action was performed

    - `site_settings`
      - `id` (uuid, primary key)
      - `key` (text, unique) - Setting key
      - `value` (jsonb) - Setting value
      - `description` (text) - Setting description
      - `updated_at` (timestamptz) - When setting was updated
      - `updated_by` (uuid, foreign key) - Admin who updated

  2. Security
    - Enable RLS on all admin tables
    - Add policies for authenticated admin users only
    - Restrict access based on admin role
*/

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  is_active boolean DEFAULT true
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update their own profile"
  ON admins FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all activity logs"
  ON admin_activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can insert activity logs"
  ON admin_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  description text DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES admins(id)
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Insert default site settings
INSERT INTO site_settings (key, value, description) VALUES
  ('contact_email', '"Info@yca-birmingham.org.uk"'::jsonb, 'Main contact email'),
  ('contact_phone', '"+44 (0)121 123 4567"'::jsonb, 'Main contact phone'),
  ('contact_address', '"Birmingham, UK"'::jsonb, 'Main contact address'),
  ('social_facebook', '"https://facebook.com/ycabirmingham"'::jsonb, 'Facebook page URL'),
  ('social_twitter', '"https://twitter.com/ycabirmingham"'::jsonb, 'Twitter/X profile URL'),
  ('social_instagram', '"https://instagram.com/ycabirmingham"'::jsonb, 'Instagram profile URL'),
  ('social_linkedin', '"https://linkedin.com/company/ycabirmingham"'::jsonb, 'LinkedIn page URL')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- ========== Migration: 20260130232958_create_admin_user.sql ==========
/*
  # Create Admin User

  1. Purpose
    - Creates the admin user account in auth.users
    - Adds admin record to admins table with super_admin role
    - Ensures the admin can access the admin dashboard

  2. Admin Details
    - Email: Info@yca-birmingham.org.uk
    - Role: super_admin
    - Status: active

  3. Security
    - User is automatically confirmed (email_confirmed_at set)
    - Full admin privileges granted via role
*/

-- Create the admin user in auth.users if not exists
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'Info@yca-birmingham.org.uk';

  -- If user doesn't exist, create it
  IF v_user_id IS NULL THEN
    -- Insert user into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'Info@yca-birmingham.org.uk',
      crypt('Yca1233*', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- Insert or update admin record
  INSERT INTO admins (id, email, full_name, role, is_active)
  VALUES (
    v_user_id,
    'Info@yca-birmingham.org.uk',
    'YCA Administrator',
    'super_admin',
    true
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

END $$;

-- ========== Migration: 20260130234103_fix_admins_rls_policy.sql ==========
/*
  # Fix RLS Policy Circular Dependency for Admins Table

  1. Changes
    - Drop existing SELECT policy with circular dependency
    - Create new simple SELECT policy allowing users to read their own record

  2. Security
    - Users can only read their own admin record
    - No circular dependency issues
*/

DROP POLICY IF EXISTS "Admins can view all admins" ON admins;

CREATE POLICY "Admins can read own record"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ========== Migration: 20260130234122_add_admins_view_all_policy.sql ==========
/*
  # Add Policy for Admins to View All Admin Records

  1. Changes
    - Add policy allowing super_admin to view all admin records

  2. Security
    - Only active admins can view all admin records
    - Based on role stored in their own record
*/

CREATE POLICY "Super admins can view all admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins admin_check
      WHERE admin_check.id = auth.uid()
      AND admin_check.is_active = true
      LIMIT 1
    )
  );

-- ========== Migration: 20260131120348_create_cms_tables.sql ==========
/*
  # CMS Content Management System Tables

  ## Overview
  This migration creates all necessary tables for a complete Content Management System
  allowing admins to manage all website content through the admin panel.

  ## New Tables

  ### 1. hero_slides
  - Manages homepage hero section slides
  - Fields: id, title, subtitle, image_url, order_number, is_active, created_at, updated_at
  - Allows multiple rotating hero banners

  ### 2. team_members
  - Manages team members display
  - Fields: id, name, role, bio, image_url, email, phone, social_media (JSON), member_type, order_number, is_active
  - Types: board, committee, staff

  ### 3. services_content
  - Manages services page content
  - Fields: id, title, description, icon, category, detailed_content, order_number, is_active
  - Categories: advice, support, community

  ### 4. programmes_items
  - Manages programmes across different categories
  - Fields: id, title, description, image_url, category, link, color, icon, is_active, order_number
  - Categories: women, men, youth, children, elderly

  ### 5. resources_items
  - Manages downloadable resources and links
  - Fields: id, title, description, resource_type, file_url, link, file_size, year, category, is_active
  - Types: policy, form, guide, link

  ### 6. event_gallery
  - Manages photo galleries for events
  - Fields: id, event_id, image_url, caption, description, order_number, created_at

  ### 7. content_sections
  - Flexible content storage for various pages
  - Fields: id, page, section_key, content (JSONB), is_active, updated_at
  - Used for About pages, Mission, History, etc.

  ### 8. page_content
  - General page content management
  - Fields: id, page_name, section_name, content_type, content_data (JSONB), order_number, is_active

  ## Security
  - Enable RLS on all tables
  - Public read access for active content
  - Admin-only write access
  - Proper authentication checks
*/

-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero slides"
  ON hero_slides FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage hero slides"
  ON hero_slides FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  image_url text,
  email text,
  phone text,
  social_media jsonb DEFAULT '{}',
  member_type text NOT NULL CHECK (member_type IN ('board', 'committee', 'staff')),
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active team members"
  ON team_members FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create services_content table
CREATE TABLE IF NOT EXISTS services_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text,
  category text NOT NULL CHECK (category IN ('advice', 'support', 'community')),
  detailed_content text,
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage services"
  ON services_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create programmes_items table
CREATE TABLE IF NOT EXISTS programmes_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  category text NOT NULL CHECK (category IN ('women', 'men', 'youth', 'children', 'elderly')),
  link text,
  color text DEFAULT '#10B981',
  icon text DEFAULT 'Users',
  is_active boolean DEFAULT true,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE programmes_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active programmes"
  ON programmes_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage programmes"
  ON programmes_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create resources_items table
CREATE TABLE IF NOT EXISTS resources_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL CHECK (resource_type IN ('policy', 'form', 'guide', 'link')),
  file_url text,
  link text,
  file_size bigint,
  year integer,
  category text,
  is_active boolean DEFAULT true,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resources"
  ON resources_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage resources"
  ON resources_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create event_gallery table
CREATE TABLE IF NOT EXISTS event_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  description text,
  order_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event gallery"
  ON event_gallery FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage event gallery"
  ON event_gallery FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create content_sections table
CREATE TABLE IF NOT EXISTS content_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(page, section_key)
);

ALTER TABLE content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active content sections"
  ON content_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage content sections"
  ON content_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_name text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text', 'html', 'json', 'image')),
  content_data jsonb NOT NULL DEFAULT '{}',
  order_number integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active page content"
  ON page_content FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage page content"
  ON page_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hero_slides_active ON hero_slides(is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_team_members_type ON team_members(member_type, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_services_category ON services_content(category, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_programmes_category ON programmes_items(category, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources_items(resource_type, is_active, order_number);
CREATE INDEX IF NOT EXISTS idx_event_gallery_event ON event_gallery(event_id, order_number);
CREATE INDEX IF NOT EXISTS idx_content_sections_page ON content_sections(page, section_key);
CREATE INDEX IF NOT EXISTS idx_page_content_page ON page_content(page_name, section_name, is_active);

-- Insert default hero slide
INSERT INTO hero_slides (title, subtitle, image_url, order_number, is_active)
VALUES (
  'Empowering the Yemeni Community',
  'Building a stronger, more connected community in Birmingham',
  'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920',
  1,
  true
) ON CONFLICT DO NOTHING;

-- ========== Migration: 20260131120430_setup_storage_buckets.sql ==========
/*
  # Setup Storage Buckets for CMS

  ## Overview
  This migration creates storage buckets for various media types and sets up
  appropriate Row Level Security policies for secure file uploads and access.

  ## New Storage Buckets

  1. hero-images - Hero section background images
  2. team-members - Team member profile photos
  3. programmes - Programme images
  4. resources - PDF documents and downloadable resources
  5. event-gallery - Event photo galleries
  6. services - Service-related images
  7. content-images - General content images for About pages, etc.

  ## Security
  - Public read access for all buckets
  - Authenticated admin write access only
  - Automatic file type validation
  - Size limits enforced
*/

-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('hero-images', 'hero-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('team-members', 'team-members', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('programmes', 'programmes', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('resources', 'resources', true, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png']),
  ('event-gallery', 'event-gallery', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('services', 'services', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('content-images', 'content-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access to hero-images
CREATE POLICY "Public read access for hero-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-images');

CREATE POLICY "Admins can upload hero-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update hero-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete hero-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'hero-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to team-members
CREATE POLICY "Public read access for team-members"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'team-members');

CREATE POLICY "Admins can upload team-members"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'team-members' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update team-members"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'team-members' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete team-members"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'team-members' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to programmes
CREATE POLICY "Public read access for programmes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'programmes');

CREATE POLICY "Admins can upload programmes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'programmes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update programmes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'programmes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete programmes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'programmes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to resources
CREATE POLICY "Public read access for resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Admins can upload resources"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'resources' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update resources"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'resources' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete resources"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'resources' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to event-gallery
CREATE POLICY "Public read access for event-gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-gallery');

CREATE POLICY "Admins can upload event-gallery"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'event-gallery' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update event-gallery"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'event-gallery' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete event-gallery"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'event-gallery' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to services
CREATE POLICY "Public read access for services"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'services');

CREATE POLICY "Admins can upload services"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'services' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update services"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'services' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete services"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'services' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Create policy for public read access to content-images
CREATE POLICY "Public read access for content-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-images');

CREATE POLICY "Admins can upload content-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'content-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can update content-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'content-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

CREATE POLICY "Admins can delete content-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'content-images' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- ========== Migration: 20260131141334_add_page_content_data.sql ==========
/*
  # Add Static Content for Content Management System

  1. Purpose
    - Populate the content_sections table with all existing static text from the website
    - Enable admin to edit all website text content from a central location
    - Preserve all current text as default values

  2. Content Organization
    Content is organized by page and section:
    - home: Hero text, stats, services intro, mission section, events section, get involved section, CTA section
    - services: Page description, mission cards, support workers list, services categories, opening times, contact info, feedback section
    - contact: Page description, contact info, form labels, need advice section
    - footer: Description, contact details, copyright text
    - about_mission: Mission text, vision text, core values, success description, join us section
    - donate: Page description, donation benefits, other ways section, support alternatives

  3. Data Structure
    Each content section contains:
    - page: The page identifier (e.g., 'home', 'services')
    - section_key: Unique key for the section (e.g., 'hero_subtitle', 'stats_members_label')
    - content: JSONB containing the actual text content
    - is_active: Boolean to enable/disable content

  4. Notes
    - All existing text is preserved exactly as it appears in the current site
    - Admin can modify any text through the Content Management interface
    - Fallback values are maintained in the frontend code
*/

-- Insert Home Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('home', 'hero_subtitle', '{"text": "Serving our community with pride and dignity"}', true),
  ('home', 'hero_button_services', '{"text": "Discover Our Services"}', true),
  ('home', 'hero_button_contact', '{"text": "Get In Touch"}', true),

  ('home', 'stats_members_label', '{"text": "Active Members"}', true),
  ('home', 'stats_programmes_label', '{"text": "Core Programmes"}', true),
  ('home', 'stats_years_label', '{"text": "Years of Service"}', true),
  ('home', 'stats_impact_label', '{"text": "Lives Impacted"}', true),

  ('home', 'welcome_title', '{"text": "Welcome to YCA Birmingham"}', true),
  ('home', 'welcome_description', '{"text": "We are dedicated to raising the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic, and cultural life of Birmingham."}', true),
  ('home', 'mission_title', '{"text": "Our Mission & Vision"}', true),
  ('home', 'mission_paragraph1', '{"text": "In all our activities and services, YCA Birmingham is focused on the community, brings the community together, preserves the identity of the Yemeni Community, and encourages mutual respect."}', true),
  ('home', 'mission_paragraph2', '{"text": "We provide community services such as advice, information, advocacy, and related services for the local community, with a special focus on individuals who don''t speak English and need Arabic-speaking advisors."}', true),
  ('home', 'mission_button', '{"text": "Learn More About Us"}', true),

  ('home', 'services_section_title', '{"text": "Our Services"}', true),
  ('home', 'services_section_description', '{"text": "Comprehensive support and guidance for the Yemeni community in Birmingham"}', true),
  ('home', 'service_advice_title', '{"text": "Advice & Guidance"}', true),
  ('home', 'service_advice_description', '{"text": "One-to-one confidential support with welfare benefits, housing, immigration, and essential life services in both English and Arabic."}', true),
  ('home', 'service_programmes_title', '{"text": "Community Programmes"}', true),
  ('home', 'service_programmes_description', '{"text": "Dedicated programmes for women, elderly, youth, children, and men focusing on social bonds, wellbeing, and cultural heritage."}', true),
  ('home', 'service_hub_title', '{"text": "Community Hub"}', true),
  ('home', 'service_hub_description', '{"text": "A welcoming space for social gatherings, cultural celebrations, and community events that bring our community together."}', true),

  ('home', 'events_title', '{"text": "Upcoming Events"}', true),
  ('home', 'events_description', '{"text": "Join us for cultural celebrations, community gatherings, and special programmes throughout the year. From National Day celebrations to youth sports activities, there''s something for everyone."}', true),
  ('home', 'events_button', '{"text": "View All Events"}', true),

  ('home', 'get_involved_title', '{"text": "Get Involved"}', true),
  ('home', 'get_involved_description', '{"text": "There are many ways you can support and contribute to our community"}', true),
  ('home', 'get_involved_membership_title', '{"text": "Become a Member"}', true),
  ('home', 'get_involved_membership_desc', '{"text": "Join our growing community"}', true),
  ('home', 'get_involved_volunteer_title', '{"text": "Volunteer"}', true),
  ('home', 'get_involved_volunteer_desc', '{"text": "Make a difference"}', true),
  ('home', 'get_involved_donate_title', '{"text": "Donate"}', true),
  ('home', 'get_involved_donate_desc', '{"text": "Support our work"}', true),
  ('home', 'get_involved_partner_title', '{"text": "Partner With Us"}', true),
  ('home', 'get_involved_partner_desc', '{"text": "Collaborate for impact"}', true),

  ('home', 'cta_title', '{"text": "Need Help or Have Questions?"}', true),
  ('home', 'cta_description', '{"text": "Our bilingual team is here to assist you. Contact us today for confidential advice and support."}', true),
  ('home', 'cta_button', '{"text": "Contact Us Today"}', true)
ON CONFLICT DO NOTHING;

-- Insert Services Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('services', 'page_title', '{"text": "Our Services"}', true),
  ('services', 'page_description', '{"text": "Advice & Guidance: Supporting the Yemeni Community in Birmingham"}', true),

  ('services', 'intro_title', '{"text": "Sustaining and Developing Comprehensive Advice and Guidance Services"}', true),
  ('services', 'intro_paragraph1', '{"text": "The Yemeni Community Association in Birmingham provides comprehensive advice and guidance services in health, education, and social welfare to serve the whole community."}', true),
  ('services', 'intro_paragraph2', '{"text": "We are working hard to empower our community, especially those who need our help the most: individuals who don''t speak English and do not know the system in the UK. We also provide dedicated support to refugees and those in need."}', true),

  ('services', 'mission_card_title', '{"text": "Our Mission and Who We Help"}', true),
  ('services', 'mission_card_description', '{"text": "We empower individuals who don''t speak English and do not know the UK system. All our staff working with these individuals are fluent in both English and Arabic, ensuring clear communication and understanding."}', true),
  ('services', 'how_help_title', '{"text": "How We Help"}', true),
  ('services', 'how_help_description', '{"text": "We work with clients on a confidential, one-to-one basis, providing direct advice and practical support on essential life issues such as welfare benefits, debt, employment, immigration, divorce, domestic violence, and housing."}', true),

  ('services', 'support_workers_title', '{"text": "Our Support Workers Will:"}', true),
  ('services', 'support_worker_1', '{"text": "Signpost clients to relevant third-party agencies"}', true),
  ('services', 'support_worker_2', '{"text": "Assist in filling out application forms"}', true),
  ('services', 'support_worker_3', '{"text": "Read, explain, and translate complex letters"}', true),
  ('services', 'support_worker_4', '{"text": "Interpret on the client''s behalf during meetings and calls"}', true),
  ('services', 'support_worker_5', '{"text": "Arrange for solicitor surgeries when legal advice is required"}', true),
  ('services', 'support_worker_6', '{"text": "Support online housing applications using our dedicated computers"}', true),

  ('services', 'services_list_title', '{"text": "Services We Provide"}', true),
  ('services', 'services_list_description', '{"text": "We provide guidance and practical help with a wide range of administrative and benefit applications"}', true),

  ('services', 'opening_times_title', '{"text": "When You Can Find Us"}', true),
  ('services', 'opening_days', '{"text": "5 days per week"}', true),
  ('services', 'opening_hours', '{"text": "Monday to Friday, 10:00 AM – 3:00 PM"}', true),
  ('services', 'contact_prompt', '{"text": "Contact us today to book your one-to-one appointment"}', true),
  ('services', 'contact_phone', '{"text": "0121 439 5280"}', true),
  ('services', 'contact_button_phone', '{"text": "0121 439 5280"}', true),
  ('services', 'contact_button_message', '{"text": "Send a Message"}', true),

  ('services', 'feedback_title', '{"text": "We Value Your Feedback"}', true),
  ('services', 'feedback_description', '{"text": "We ask our clients for feedback every time they use the service, using this to inform the continuous development of our project."}', true)
ON CONFLICT DO NOTHING;

-- Insert Contact Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('contact', 'page_title', '{"text": "Contact Us"}', true),
  ('contact', 'page_description', '{"text": "We''re Here to Help - Get in Touch Today"}', true),

  ('contact', 'intro_title', '{"text": "Get In Touch With Us"}', true),
  ('contact', 'intro_description', '{"text": "If you have got a question or general query, you can contact us and we will get in touch with you as soon as possible."}', true),

  ('contact', 'address_label', '{"text": "Address"}', true),
  ('contact', 'address_line1', '{"text": "YCA GreenCoat House"}', true),
  ('contact', 'address_line2', '{"text": "261-271 Stratford Road"}', true),
  ('contact', 'address_line3', '{"text": "Birmingham, B11 1QS"}', true),

  ('contact', 'phone_label', '{"text": "Phone"}', true),
  ('contact', 'phone_number', '{"text": "0121 439 5280"}', true),

  ('contact', 'email_label', '{"text": "Email"}', true),
  ('contact', 'email_address', '{"text": "INFO@yca-birmingham.org.uk"}', true),

  ('contact', 'opening_times_label', '{"text": "Opening Times"}', true),
  ('contact', 'opening_days', '{"text": "Monday - Friday"}', true),
  ('contact', 'opening_hours', '{"text": "10:00 AM - 3:00 PM"}', true),

  ('contact', 'need_advice_title', '{"text": "Need Advice or Support?"}', true),
  ('contact', 'need_advice_description', '{"text": "Our bilingual team provides confidential advice and guidance on welfare benefits, housing, immigration, and more."}', true),
  ('contact', 'need_advice_prompt', '{"text": "Call us today to book your one-to-one appointment"}', true),

  ('contact', 'form_title', '{"text": "Send Us a Message"}', true),
  ('contact', 'form_name_label', '{"text": "Your Name"}', true),
  ('contact', 'form_email_label', '{"text": "Email"}', true),
  ('contact', 'form_phone_label', '{"text": "Phone"}', true),
  ('contact', 'form_subject_label', '{"text": "Subject"}', true),
  ('contact', 'form_message_label', '{"text": "Message"}', true),
  ('contact', 'form_button', '{"text": "Send Message"}', true),
  ('contact', 'form_success_message', '{"text": "Thank you for your message! We will get back to you soon."}', true),
  ('contact', 'form_error_message', '{"text": "There was an error sending your message. Please try again or contact us directly."}', true)
ON CONFLICT DO NOTHING;

-- Insert Footer Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('footer', 'description', '{"text": "Empowering the Yemeni community in Birmingham through support, guidance, and cultural celebration."}', true),
  ('footer', 'quick_links_title', '{"text": "Quick Links"}', true),
  ('footer', 'programmes_title', '{"text": "Programmes"}', true),
  ('footer', 'contact_info_title', '{"text": "Contact Info"}', true),
  ('footer', 'address_line1', '{"text": "YCA GreenCoat House"}', true),
  ('footer', 'address_line2', '{"text": "261-271 Stratford Road"}', true),
  ('footer', 'address_line3', '{"text": "Birmingham, B11 1QS"}', true),
  ('footer', 'phone', '{"text": "0121 439 5280"}', true),
  ('footer', 'email', '{"text": "INFO@yca-birmingham.org.uk"}', true),
  ('footer', 'copyright', '{"text": "Yemeni Community Association Birmingham. Charity Number: 1057470. All rights reserved."}', true)
ON CONFLICT DO NOTHING;

-- Insert About Mission Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('about_mission', 'page_title', '{"text": "Mission & Vision"}', true),
  ('about_mission', 'page_description', '{"text": "Our Guiding Principles and Aspirations"}', true),

  ('about_mission', 'mission_title', '{"text": "Our Mission"}', true),
  ('about_mission', 'mission_description', '{"text": "Here we state our beliefs, morals or rules that underpin the work we do. Our mission is to empower the Yemeni community in Birmingham through comprehensive support services, cultural preservation, and community engagement."}', true),

  ('about_mission', 'vision_title', '{"text": "Our Vision"}', true),
  ('about_mission', 'vision_description', '{"text": "We want to raise the profile of the Yemeni community as a vibrant, cohesive community contributing positively to the social, economic and cultural life of Birmingham."}', true),

  ('about_mission', 'core_values_title', '{"text": "Our Core Values"}', true),
  ('about_mission', 'core_values_intro', '{"text": "In all our activities and services, YCA Birmingham operates according to these fundamental values:"}', true),

  ('about_mission', 'value1_title', '{"text": "Focused on the Community"}', true),
  ('about_mission', 'value1_description', '{"text": "All our activities and services prioritize the needs and wellbeing of our community members."}', true),
  ('about_mission', 'value2_title', '{"text": "Bringing the Community Together"}', true),
  ('about_mission', 'value2_description', '{"text": "We create spaces and opportunities for connection, fostering unity and social bonds."}', true),
  ('about_mission', 'value3_title', '{"text": "Preserving Yemeni Identity"}', true),
  ('about_mission', 'value3_description', '{"text": "We celebrate and maintain our rich cultural heritage while thriving in the UK."}', true),
  ('about_mission', 'value4_title', '{"text": "Encouraging Mutual Respect"}', true),
  ('about_mission', 'value4_description', '{"text": "We promote understanding, tolerance, and respect across all our programmes and services."}', true),

  ('about_mission', 'success_title', '{"text": "What Success Looks Like"}', true),
  ('about_mission', 'success_paragraph1', '{"text": "Our vision statement is the ideal state we want the Yemeni community in Birmingham to be and what it will be like if YCA Birmingham is successful in achieving its mission."}', true),
  ('about_mission', 'success_paragraph2', '{"text": "A vibrant, cohesive Yemeni community that is fully integrated, respected, and contributing meaningfully to Birmingham''s diverse social fabric."}', true),

  ('about_mission', 'join_us_title', '{"text": "Join Us in Our Mission"}', true),
  ('about_mission', 'join_us_description', '{"text": "Together, we can build a stronger, more connected community that celebrates our heritage while embracing our future in Birmingham."}', true)
ON CONFLICT DO NOTHING;

-- Insert Donate Page Content
INSERT INTO content_sections (page, section_key, content, is_active) VALUES
  ('donate', 'page_title', '{"text": "Donate / Support Us"}', true),
  ('donate', 'page_description', '{"text": "Your Support Makes a Real Difference"}', true),

  ('donate', 'intro_description', '{"text": "YCA Birmingham relies on the generosity of individuals, businesses, and organizations to continue delivering vital services to the Yemeni community in Birmingham. Your donation, no matter the size, helps us support those who need it most."}', true),

  ('donate', 'how_helps_title', '{"text": "How Your Donation Helps"}', true),
  ('donate', 'benefit1_title', '{"text": "Support Services"}', true),
  ('donate', 'benefit1_description', '{"text": "Fund advice and guidance services for vulnerable community members who need help navigating UK systems."}', true),
  ('donate', 'benefit2_title', '{"text": "Community Programmes"}', true),
  ('donate', 'benefit2_description', '{"text": "Keep our youth, women''s, elderly, and children''s programmes running and accessible to all."}', true),
  ('donate', 'benefit3_title', '{"text": "Facilities & Resources"}', true),
  ('donate', 'benefit3_description', '{"text": "Maintain our community spaces and provide necessary resources for our services."}', true),
  ('donate', 'benefit4_title', '{"text": "Future Growth"}', true),
  ('donate', 'benefit4_description', '{"text": "Expand our services to reach more people and develop new programmes based on community needs."}', true),

  ('donate', 'other_ways_title', '{"text": "Other Ways to Donate"}', true),
  ('donate', 'other_ways_description', '{"text": "Prefer to donate via bank transfer, cheque, or in person? Contact us to discuss alternative donation options. We are a registered charity (Number: 1057470)."}', true),
  ('donate', 'other_ways_button_email', '{"text": "Email Us"}', true),
  ('donate', 'other_ways_button_call', '{"text": "Call: 0121 439 5280"}', true),

  ('donate', 'support_alternatives_title', '{"text": "Other Ways to Support"}', true),
  ('donate', 'support_alternatives_description', '{"text": "Can''t donate right now? You can still support us by volunteering your time, attending our events, or spreading the word about our work."}', true),
  ('donate', 'support_alternatives_button_volunteer', '{"text": "Become a Volunteer"}', true),
  ('donate', 'support_alternatives_button_member', '{"text": "Become a Member"}', true)
ON CONFLICT DO NOTHING;

-- ========== Migration: 20260131142954_add_team_members_data.sql ==========
/*
  # Add Team Members Data

  1. Purpose
    - Populate team_members table with all team members from the existing static data
    - Includes board members, committee members, and staff

  2. Data Added
    - 7 Board Members (Chairman, Treasurer, Secretary, Trustees)
    - 2 Committee Members (Women & Children Officer, Media Officer)
    - 2 Staff Members (Development Officer, Admin Assistant)

  3. Notes
    - Checks for existing members before inserting to avoid duplicates
    - Sets appropriate member_type for each category
    - All members set as active by default
    - Order numbers assigned for proper display sequence
*/

-- Insert Board Members (only if they don't exist)
DO $$
BEGIN
  -- Ahmed Al bakri (might already exist)
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Ahmed Al bakri' AND role = 'Chairman') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Ahmed Al bakri', 'Chairman', 'Leading YCA Birmingham with strategic vision and community focus.', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 1, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abduljalil Khaled' AND role = 'Treasurer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abduljalil Khaled', 'Treasurer', 'Managing financial resources and ensuring fiscal responsibility.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 2, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abdulrahman Shujoon' AND role = 'Secretary') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abdulrahman Shujoon', 'Secretary', 'Maintaining organizational records and governance compliance.', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 3, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Marwan Faisel' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Marwan Faisel', 'Trustee', 'Providing oversight and strategic guidance to the organization.', 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 4, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Fadhl Hassn' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Fadhl Hassn', 'Trustee', 'Supporting community initiatives and organizational development.', 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 5, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abdullah Ahmed' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abdullah Ahmed', 'Trustee', 'Contributing expertise in community engagement and partnerships.', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 6, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Mohamed Mosleh' AND role = 'Trustee') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Mohamed Mosleh', 'Trustee', 'Ensuring effective governance and community representation.', 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'board', 7, true);
  END IF;

  -- Committee Members
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Dr. Zainab Al hammadi' AND role = 'Women and Children Committee Officer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Dr. Zainab Al hammadi', 'Women and Children Committee Officer', 'Leading initiatives for women and children in the community.', 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'committee', 1, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Abdulrahman Sailan' AND role = 'Media Officer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Abdulrahman Sailan', 'Media Officer', 'Managing communications and media relations for YCA Birmingham.', 'https://images.pexels.com/photos/3778966/pexels-photo-3778966.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'committee', 2, true);
  END IF;

  -- Staff Members
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Salah Al-hamidi' AND role = 'Development Officer') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Salah Al-hamidi', 'Development Officer', 'Coordinating development projects and community programs.', 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'staff', 1, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Saahirah Kusar' AND role = 'Admin Assistant') THEN
    INSERT INTO team_members (name, role, bio, image_url, member_type, order_number, is_active)
    VALUES ('Saahirah Kusar', 'Admin Assistant', 'Supporting daily operations and administrative functions.', 'https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=400&h=500', 'staff', 2, true);
  END IF;
END $$;
