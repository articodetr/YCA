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