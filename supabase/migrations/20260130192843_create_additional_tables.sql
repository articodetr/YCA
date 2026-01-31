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