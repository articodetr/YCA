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
