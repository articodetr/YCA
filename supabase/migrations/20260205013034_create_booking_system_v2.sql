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