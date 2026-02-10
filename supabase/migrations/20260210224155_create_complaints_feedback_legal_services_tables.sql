/*
  # Create Complaints, Feedback, Translation, Other Legal Services, and Business Supporters Tables

  1. New Tables
    - `complaints_submissions` - Complaints and suggestions
    - `service_feedback` - Service feedback/evaluation
    - `translation_requests` - Translation service requests
    - `other_legal_requests` - Other legal/documentation requests
    - `business_supporters` - Approved business supporters for public display

  2. Security
    - Enable RLS on all tables
    - Public can insert complaints and feedback (anonymous)
    - Authenticated users can insert translation/legal requests
    - Admins can manage all records
*/

-- Complaints & Suggestions
CREATE TABLE IF NOT EXISTS complaints_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number text UNIQUE NOT NULL DEFAULT ('CS-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6)),
  name text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  feedback_type text NOT NULL DEFAULT 'complaint',
  details text NOT NULL DEFAULT '',
  desired_outcome text DEFAULT '',
  contact_requested boolean DEFAULT false,
  preferred_contact_method text DEFAULT '',
  stage integer DEFAULT 1,
  action_taken text DEFAULT '',
  outcome_date timestamptz,
  supervisor_signoff text DEFAULT '',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE complaints_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit complaints"
  ON complaints_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view complaints"
  ON complaints_submissions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can update complaints"
  ON complaints_submissions FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can delete complaints"
  ON complaints_submissions FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Service Feedback
CREATE TABLE IF NOT EXISTS service_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type text NOT NULL DEFAULT '',
  service_date date,
  ratings jsonb DEFAULT '{}',
  what_went_well text DEFAULT '',
  what_to_improve text DEFAULT '',
  other_comments text DEFAULT '',
  would_recommend text DEFAULT 'not_sure',
  contact_requested boolean DEFAULT false,
  contact_name text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  equality_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON service_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view feedback"
  ON service_feedback FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can update feedback"
  ON service_feedback FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can delete feedback"
  ON service_feedback FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Translation Requests
CREATE TABLE IF NOT EXISTS translation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  notes text NOT NULL DEFAULT '',
  file_url text DEFAULT '',
  preferred_deadline date,
  amount_due numeric DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_intent_id text DEFAULT '',
  status text DEFAULT 'submitted',
  is_first_request boolean DEFAULT false,
  consent_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE translation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert translation requests"
  ON translation_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own translation requests"
  ON translation_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Admins can update translation requests"
  ON translation_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can delete translation requests"
  ON translation_requests FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Other Legal Requests
CREATE TABLE IF NOT EXISTS other_legal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  service_needed text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  file_url text DEFAULT '',
  amount_due numeric DEFAULT 0,
  payment_status text DEFAULT 'pending',
  payment_intent_id text DEFAULT '',
  status text DEFAULT 'submitted',
  is_first_request boolean DEFAULT false,
  consent_given boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE other_legal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert other legal requests"
  ON other_legal_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own other legal requests"
  ON other_legal_requests FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid())
  );

CREATE POLICY "Admins can update other legal requests"
  ON other_legal_requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can delete other legal requests"
  ON other_legal_requests FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Business Supporters (public display)
CREATE TABLE IF NOT EXISTS business_supporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_application_id uuid,
  business_name text NOT NULL DEFAULT '',
  logo_url text DEFAULT '',
  website_url text DEFAULT '',
  tier text NOT NULL DEFAULT 'bronze',
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  approved_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE business_supporters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active business supporters"
  ON business_supporters FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert business supporters"
  ON business_supporters FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can update business supporters"
  ON business_supporters FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Admins can delete business supporters"
  ON business_supporters FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints_submissions(status);
CREATE INDEX IF NOT EXISTS idx_complaints_type ON complaints_submissions(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_service_type ON service_feedback(service_type);
CREATE INDEX IF NOT EXISTS idx_translation_user ON translation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_translation_status ON translation_requests(status);
CREATE INDEX IF NOT EXISTS idx_other_legal_user ON other_legal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_other_legal_status ON other_legal_requests(status);
CREATE INDEX IF NOT EXISTS idx_business_supporters_tier ON business_supporters(tier);
CREATE INDEX IF NOT EXISTS idx_business_supporters_active ON business_supporters(is_active);
