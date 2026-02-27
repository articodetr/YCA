/*
  # Create Jobs tables (job_postings + job_applications)

  This project includes Jobs / Roles / Opportunities pages that expect:
  - public.job_postings
  - public.job_applications

  This migration creates those tables if they don't exist, adds an external
  application URL field, and applies RLS policies:
  - Public can read active job postings
  - Admins (active records in public.admins) can manage job postings
  - Public can submit job applications (optional feature)
  - Admins can view/manage job applications
*/

-- ------------------------------------------------------------
-- 1) job_postings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  department text DEFAULT '',
  employment_type text NOT NULL DEFAULT 'full_time',
  location text DEFAULT 'Birmingham, UK',
  salary_range text DEFAULT '',
  requirements_en text DEFAULT '',
  requirements_ar text DEFAULT '',
  responsibilities_en text DEFAULT '',
  responsibilities_ar text DEFAULT '',
  application_deadline date,
  application_url text,
  is_active boolean NOT NULL DEFAULT true,
  applications_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_active_created
  ON public.job_postings (is_active, created_at DESC);

COMMENT ON COLUMN public.job_postings.application_url IS
  'External link for job applications (e.g., Google Form, ATS, email link).';

-- ------------------------------------------------------------
-- 2) job_applications (optional internal applications)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id uuid NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  resume_url text DEFAULT '',
  cover_letter text DEFAULT '',
  portfolio_url text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewing','shortlisted','rejected','hired')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job_created
  ON public.job_applications (job_posting_id, created_at DESC);

-- Keep a simple applications_count on job_postings (best-effort)
CREATE OR REPLACE FUNCTION public.increment_job_applications_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.job_postings
  SET applications_count = COALESCE(applications_count, 0) + 1,
      updated_at = now()
  WHERE id = NEW.job_posting_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_job_applications_increment_count ON public.job_applications;
CREATE TRIGGER trg_job_applications_increment_count
AFTER INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.increment_job_applications_count();

-- ------------------------------------------------------------
-- 3) RLS policies
-- ------------------------------------------------------------
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Public: read active job postings
DROP POLICY IF EXISTS "Public can view active job postings" ON public.job_postings;
CREATE POLICY "Public can view active job postings"
  ON public.job_postings
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admin: full job postings CRUD
DROP POLICY IF EXISTS "Admins can view all job postings" ON public.job_postings;
CREATE POLICY "Admins can view all job postings"
  ON public.job_postings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert job postings" ON public.job_postings;
CREATE POLICY "Admins can insert job postings"
  ON public.job_postings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update job postings" ON public.job_postings;
CREATE POLICY "Admins can update job postings"
  ON public.job_postings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete job postings" ON public.job_postings;
CREATE POLICY "Admins can delete job postings"
  ON public.job_postings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

-- Public: submit job applications (only for active jobs)
DROP POLICY IF EXISTS "Public can submit job applications" ON public.job_applications;
CREATE POLICY "Public can submit job applications"
  ON public.job_applications
  FOR INSERT
  TO public
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.job_postings jp
      WHERE jp.id = job_posting_id
      AND jp.is_active = true
    )
  );

-- Admin: view/manage applications
DROP POLICY IF EXISTS "Admins can view job applications" ON public.job_applications;
CREATE POLICY "Admins can view job applications"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update job applications" ON public.job_applications;
CREATE POLICY "Admins can update job applications"
  ON public.job_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete job applications" ON public.job_applications;
CREATE POLICY "Admins can delete job applications"
  ON public.job_applications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE admins.id = auth.uid()
      AND admins.is_active = true
    )
  );
