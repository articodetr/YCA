/*
  # Member Number Auto-Generation and Expiry Tracking System

  1. New Features
    - Auto-generate member numbers in format YCA260001, YCA260002, etc.
    - Create sequence starting from 260001
    - Automatic member number assignment on member creation
    - Expiry monitoring views for admin dashboard
    - Notification tracking system

  2. Changes
    - Create sequence `members_number_seq` starting at 260001
    - Create function `generate_member_number()` to format YCA numbers
    - Create trigger to auto-assign member numbers
    - Add indexes on member_number, expiry_date, status for performance
    - Create view `expiring_memberships` for easy expiry monitoring
    - Create table `membership_notifications` to track sent emails

  3. Security
    - Enable RLS on membership_notifications table
    - Only admins can view notification records
*/

-- Create sequence for member numbers starting from 260001
CREATE SEQUENCE IF NOT EXISTS members_number_seq START WITH 260001;

-- Create function to generate YCA member number
CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'YCA' || LPAD(nextval('members_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-assign member number
CREATE OR REPLACE FUNCTION assign_member_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign if member_number is empty or default
  IF NEW.member_number = '' OR NEW.member_number IS NULL THEN
    NEW.member_number := generate_member_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_assign_member_number ON members;
CREATE TRIGGER trigger_assign_member_number
  BEFORE INSERT ON members
  FOR EACH ROW
  EXECUTE FUNCTION assign_member_number();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_member_number ON members(member_number);
CREATE INDEX IF NOT EXISTS idx_members_expiry_date ON members(expiry_date);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
CREATE INDEX IF NOT EXISTS idx_members_expiry_status ON members(expiry_date, status);

-- Create view for expiring memberships (next 90 days)
CREATE OR REPLACE VIEW expiring_memberships AS
SELECT 
  m.*,
  CASE 
    WHEN m.expiry_date < CURRENT_DATE THEN 'expired'
    WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
    WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
    WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'notice'
    WHEN m.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'info'
    ELSE 'active'
  END AS expiry_status,
  (m.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM members m
WHERE m.expiry_date IS NOT NULL
  AND m.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
ORDER BY m.expiry_date ASC;

-- Create table to track membership notifications
CREATE TABLE IF NOT EXISTS membership_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('expiry_30_days', 'expiry_7_days', 'expired', 'renewal_confirmation', 'manual')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  sent_by uuid REFERENCES admins(id),
  email_subject text NOT NULL,
  email_body text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'bounced')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on membership_notifications
ALTER TABLE membership_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON membership_notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Policy: Admins can insert notifications
CREATE POLICY "Admins can insert notifications"
  ON membership_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Add index on membership_notifications for performance
CREATE INDEX IF NOT EXISTS idx_membership_notifications_member_id ON membership_notifications(member_id);
CREATE INDEX IF NOT EXISTS idx_membership_notifications_sent_at ON membership_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_membership_notifications_type ON membership_notifications(notification_type);

-- Create function to automatically update expired members status
CREATE OR REPLACE FUNCTION update_expired_member_status()
RETURNS void AS $$
BEGIN
  UPDATE members
  SET status = 'expired'
  WHERE expiry_date < CURRENT_DATE
    AND status != 'expired';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get members needing notification
CREATE OR REPLACE FUNCTION get_members_needing_notification(days_before integer)
RETURNS TABLE (
  member_id uuid,
  member_number text,
  first_name text,
  last_name text,
  email text,
  phone text,
  expiry_date date,
  days_until_expiry integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.member_number,
    m.first_name,
    m.last_name,
    m.email,
    m.phone,
    m.expiry_date,
    (m.expiry_date - CURRENT_DATE)::integer
  FROM members m
  WHERE m.expiry_date = CURRENT_DATE + (days_before || ' days')::interval
    AND m.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM membership_notifications mn
      WHERE mn.member_id = m.id
        AND mn.notification_type = 'expiry_' || days_before || '_days'
        AND mn.sent_at::date = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create table for membership renewals tracking
CREATE TABLE IF NOT EXISTS membership_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  previous_expiry_date date NOT NULL,
  new_expiry_date date NOT NULL,
  payment_amount numeric NOT NULL,
  payment_date timestamptz NOT NULL DEFAULT now(),
  payment_intent_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on membership_renewals
ALTER TABLE membership_renewals ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their own renewals
CREATE POLICY "Members can view own renewals"
  ON membership_renewals
  FOR SELECT
  TO authenticated
  USING (member_id = auth.uid());

-- Policy: Admins can view all renewals
CREATE POLICY "Admins can view all renewals"
  ON membership_renewals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins 
      WHERE admins.id = auth.uid()
    )
  );

-- Add index on renewals
CREATE INDEX IF NOT EXISTS idx_membership_renewals_member_id ON membership_renewals(member_id);
CREATE INDEX IF NOT EXISTS idx_membership_renewals_payment_date ON membership_renewals(payment_date);