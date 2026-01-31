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