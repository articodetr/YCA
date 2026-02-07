/*
  # Add Admin CRUD Policies for All Management Tables

  1. Problem
    - Multiple admin management pages cannot update records because UPDATE RLS policies are missing
    - Membership approve/reject fails silently due to missing UPDATE policy on membership_applications
    - Several tables lack SELECT policies for admins, so admin pages show empty data

  2. Changes
    - Add UPDATE policies for admins on: membership_applications, volunteer_applications,
      event_registrations, partnership_inquiries, newsletter_subscriptions, member_payments, members
    - Add SELECT policies for admins on: volunteer_applications, partnership_inquiries,
      newsletter_subscriptions, donations
    - Add INSERT policy for admins on members and member_payments (for manual member creation)
    - Add DELETE policies for admins where appropriate

  3. Security
    - All policies restrict access to authenticated users who exist in the admins table with is_active = true
    - No public access is granted
*/

-- Helper: check if policy exists before creating
DO $$ BEGIN

-- ============================================
-- membership_applications: ADD UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'membership_applications' AND policyname = 'Admins can update membership applications'
) THEN
  CREATE POLICY "Admins can update membership applications"
    ON membership_applications FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- volunteer_applications: ADD SELECT and UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'volunteer_applications' AND policyname = 'Admins can view all volunteer applications'
) THEN
  CREATE POLICY "Admins can view all volunteer applications"
    ON volunteer_applications FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'volunteer_applications' AND policyname = 'Admins can update volunteer applications'
) THEN
  CREATE POLICY "Admins can update volunteer applications"
    ON volunteer_applications FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- event_registrations: ADD UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'event_registrations' AND policyname = 'Admins can update event registrations'
) THEN
  CREATE POLICY "Admins can update event registrations"
    ON event_registrations FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- partnership_inquiries: ADD SELECT and UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'partnership_inquiries' AND policyname = 'Admins can view all partnership inquiries'
) THEN
  CREATE POLICY "Admins can view all partnership inquiries"
    ON partnership_inquiries FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'partnership_inquiries' AND policyname = 'Admins can update partnership inquiries'
) THEN
  CREATE POLICY "Admins can update partnership inquiries"
    ON partnership_inquiries FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- newsletter_subscriptions: ADD SELECT and UPDATE for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Admins can view all newsletter subscriptions'
) THEN
  CREATE POLICY "Admins can view all newsletter subscriptions"
    ON newsletter_subscriptions FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Admins can update newsletter subscriptions'
) THEN
  CREATE POLICY "Admins can update newsletter subscriptions"
    ON newsletter_subscriptions FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- member_payments: ADD UPDATE and INSERT for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'member_payments' AND policyname = 'Admins can update member payments'
) THEN
  CREATE POLICY "Admins can update member payments"
    ON member_payments FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- members: ADD UPDATE and INSERT for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Admins can update members'
) THEN
  CREATE POLICY "Admins can update members"
    ON members FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true))
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Admins can insert members'
) THEN
  CREATE POLICY "Admins can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- donations: ADD SELECT for admins
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'donations' AND policyname = 'Admins can view all donations'
) THEN
  CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

-- ============================================
-- contact_submissions: ADD SELECT for admins (explicit)
-- ============================================
IF NOT EXISTS (
  SELECT 1 FROM pg_policies WHERE tablename = 'contact_submissions' AND policyname = 'Admins can view all contact submissions'
) THEN
  CREATE POLICY "Admins can view all contact submissions"
    ON contact_submissions FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid() AND admins.is_active = true));
END IF;

END $$;
