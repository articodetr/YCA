# Dynamic Forms System - Setup Instructions

## Overview

The dynamic forms system has been successfully implemented! This system allows admins to customize questions for volunteer applications, partnership inquiries, and job applications through an intuitive admin interface.

## ✅ What's Been Completed

### 1. Frontend Components
- ✅ **DynamicFormModal** - Beautiful, reusable modal component with step-by-step navigation
- ✅ **Partnership Page** - Updated with elegant modal button
- ✅ **Volunteer Page** - Updated with elegant modal button
- ✅ **Jobs Page** - Displays job postings with application modal
- ✅ **FormQuestionsManagement** - Admin page to manage form questions
- ✅ **JobPostingsManagement** - Admin page to manage job postings

### 2. Features Implemented
- Multi-step form navigation with progress indicator
- Support for 10 question types (text, textarea, select, radio, checkbox, date, file, email, phone, number)
- Bilingual support (English/Arabic) for all questions
- Drag & drop ordering for questions
- Dynamic validation rules
- File upload support for resumes and documents
- Real-time form preview
- Question activation/deactivation
- Section grouping for questions

## 🔧 Database Setup Required

Due to system limitations, the database migration needs to be applied manually. Please run the following SQL in your Supabase SQL Editor:

```sql
-- Create form_questions table
CREATE TABLE IF NOT EXISTS form_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL CHECK (form_type IN ('volunteer', 'partnership', 'job_application')),
  question_text_en text NOT NULL,
  question_text_ar text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'file', 'email', 'phone', 'number')),
  options jsonb DEFAULT '[]'::jsonb,
  placeholder_en text,
  placeholder_ar text,
  is_required boolean DEFAULT true,
  validation_rules jsonb DEFAULT '{}'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  section text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL CHECK (form_type IN ('volunteer', 'partnership', 'job_application')),
  application_id uuid NOT NULL,
  question_id uuid REFERENCES form_questions(id) ON DELETE CASCADE,
  response_text text,
  response_files jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en text NOT NULL,
  title_ar text NOT NULL,
  description_en text NOT NULL,
  description_ar text NOT NULL,
  department text,
  employment_type text NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'volunteer')),
  location text,
  salary_range text,
  requirements_en text,
  requirements_ar text,
  responsibilities_en text,
  responsibilities_ar text,
  application_deadline date,
  is_active boolean DEFAULT true,
  custom_questions jsonb DEFAULT '[]'::jsonb,
  applications_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  resume_url text NOT NULL,
  cover_letter text,
  portfolio_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'interviewed', 'accepted', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for form_questions
DROP POLICY IF EXISTS "Anyone can view active questions" ON form_questions;
CREATE POLICY "Anyone can view active questions"
  ON form_questions FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage questions" ON form_questions;
CREATE POLICY "Admins can manage questions"
  ON form_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Policies for form_responses
DROP POLICY IF EXISTS "Anyone can submit responses" ON form_responses;
CREATE POLICY "Anyone can submit responses"
  ON form_responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all responses" ON form_responses;
CREATE POLICY "Admins can view all responses"
  ON form_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Policies for job_postings
DROP POLICY IF EXISTS "Anyone can view active job postings" ON job_postings;
CREATE POLICY "Anyone can view active job postings"
  ON job_postings FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage job postings" ON job_postings;
CREATE POLICY "Admins can manage job postings"
  ON job_postings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Policies for job_applications
DROP POLICY IF EXISTS "Anyone can submit job applications" ON job_applications;
CREATE POLICY "Anyone can submit job applications"
  ON job_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own applications" ON job_applications;
CREATE POLICY "Users can view own applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all job applications" ON job_applications;
CREATE POLICY "Admins can view all job applications"
  ON job_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );

DROP POLICY IF EXISTS "Admins can update job applications" ON job_applications;
CREATE POLICY "Admins can update job applications"
  ON job_applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_questions_form_type ON form_questions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_questions_order ON form_questions(order_index);
CREATE INDEX IF NOT EXISTS idx_form_responses_application ON form_responses(application_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_question ON form_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_applications_posting ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_form_questions_updated_at ON form_questions;
CREATE TRIGGER update_form_questions_updated_at
  BEFORE UPDATE ON form_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default volunteer questions
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, order_index, section) VALUES
('volunteer', 'What are your areas of interest?', 'ما هي مجالات اهتمامك؟', 'textarea', 'e.g., Youth work, elderly care, admin support...', 'مثال: العمل مع الشباب، رعاية المسنين، الدعم الإداري...', true, 1, 'interests'),
('volunteer', 'What skills can you offer?', 'ما هي المهارات التي يمكنك تقديمها؟', 'textarea', 'e.g., Language skills, IT, counseling...', 'مثال: مهارات لغوية، تقنية معلومات، استشارات...', true, 2, 'skills'),
('volunteer', 'When are you available?', 'متى تكون متاحاً؟', 'select', 'Select your availability', 'حدد أوقات توفرك', true, 3, 'availability'),
('volunteer', 'Do you have previous volunteering experience?', 'هل لديك خبرة سابقة في العمل التطوعي؟', 'textarea', 'Please describe your experience...', 'يرجى وصف خبرتك...', false, 4, 'experience'),
('volunteer', 'Why do you want to volunteer with YCA?', 'لماذا تريد التطوع مع YCA؟', 'textarea', 'Tell us your motivation...', 'أخبرنا عن دوافعك...', true, 5, 'motivation')
ON CONFLICT DO NOTHING;

-- Add options for availability question
UPDATE form_questions
SET options = '[
  {"value": "weekday_mornings", "label_en": "Weekday Mornings", "label_ar": "صباح أيام الأسبوع"},
  {"value": "weekday_afternoons", "label_en": "Weekday Afternoons", "label_ar": "بعد الظهر أيام الأسبوع"},
  {"value": "weekday_evenings", "label_en": "Weekday Evenings", "label_ar": "مساء أيام الأسبوع"},
  {"value": "weekends", "label_en": "Weekends", "label_ar": "عطلة نهاية الأسبوع"},
  {"value": "flexible", "label_en": "Flexible", "label_ar": "مرن"}
]'::jsonb
WHERE form_type = 'volunteer' AND question_text_en = 'When are you available?';

-- Insert default partnership questions
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, order_index, section) VALUES
('partnership', 'What type of organization do you represent?', 'ما نوع المنظمة التي تمثلها؟', 'select', 'Select organization type', 'حدد نوع المنظمة', true, 1, 'organization'),
('partnership', 'What is your area of partnership interest?', 'ما هو مجال اهتمامك بالشراكة؟', 'textarea', 'Describe the partnership area...', 'صف مجال الشراكة...', true, 2, 'interest'),
('partnership', 'What can your organization offer?', 'ماذا يمكن لمنظمتك أن تقدم؟', 'textarea', 'Describe what you can contribute...', 'صف ما يمكنك المساهمة به...', true, 3, 'contribution'),
('partnership', 'What are your partnership goals?', 'ما هي أهداف الشراكة؟', 'textarea', 'Describe your goals...', 'صف أهدافك...', true, 4, 'goals')
ON CONFLICT DO NOTHING;

-- Add options for organization type
UPDATE form_questions
SET options = '[
  {"value": "charity", "label_en": "Charity/Non-Profit", "label_ar": "مؤسسة خيرية/غير ربحية"},
  {"value": "business", "label_en": "Business/Corporate", "label_ar": "شركة/قطاع خاص"},
  {"value": "government", "label_en": "Government Agency", "label_ar": "جهة حكومية"},
  {"value": "education", "label_en": "Educational Institution", "label_ar": "مؤسسة تعليمية"},
  {"value": "healthcare", "label_en": "Healthcare Provider", "label_ar": "مقدم رعاية صحية"},
  {"value": "other", "label_en": "Other", "label_ar": "أخرى"}
]'::jsonb
WHERE form_type = 'partnership' AND question_text_en = 'What type of organization do you represent?';

-- Create storage bucket for job application resumes if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-resumes', 'job-resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for job resumes
DROP POLICY IF EXISTS "Anyone can upload job resumes" ON storage.objects;
CREATE POLICY "Anyone can upload job resumes"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'job-resumes');

DROP POLICY IF EXISTS "Admins can view job resumes" ON storage.objects;
CREATE POLICY "Admins can view job resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'job-resumes' AND
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()
      AND admins.role IN ('super_admin', 'admin')
    )
  );
```

## 🚀 How to Use

### For Admin Users

1. **Manage Form Questions**
   - Navigate to `/admin/form-questions`
   - Switch between form types using tabs (Volunteer, Partnership, Job Applications)
   - Add, edit, or delete questions
   - Configure question types, options, validation rules
   - Activate/deactivate questions without deleting them

2. **Manage Job Postings**
   - Navigate to `/admin/job-postings`
   - Add new job postings with full bilingual support
   - Set employment type, location, salary range
   - Define requirements and responsibilities
   - Set application deadlines
   - Activate/deactivate job postings

3. **View Applications**
   - Volunteer applications: `/admin/volunteers`
   - Partnership inquiries: `/admin/partnerships`
   - Job applications: View from job postings page

### For Website Visitors

1. **Apply for Volunteer Opportunities**
   - Visit `/get-involved/volunteer`
   - Click the "Start Application" button
   - Complete the beautiful step-by-step form
   - Upload documents if required

2. **Submit Partnership Inquiry**
   - Visit `/get-involved/partnerships`
   - Click "Start Partnership Application"
   - Answer customized questions
   - Submit inquiry

3. **Apply for Jobs**
   - Visit `/get-involved/jobs`
   - Browse available positions
   - Click "Apply Now" on any job
   - Upload resume and complete application

## 🎨 Design Features

- Modern, gradient card designs with smooth animations
- Step-by-step form navigation with progress indicators
- Responsive design works perfectly on mobile and desktop
- Bilingual support (English/Arabic) throughout
- Beautiful success/error messaging
- Smooth transitions and hover effects
- Clean, intuitive admin interface

## 📝 Notes

- The basic information fields (name, email, phone) are still stored in the original tables (volunteer_applications, partnership_inquiries, job_applications)
- Dynamic question responses are stored in the `form_responses` table and linked to the main application
- File uploads are handled through Supabase Storage
- All forms include automatic validation and error handling
- Admin can customize forms without touching code

## 🔄 Future Enhancements (Optional)

- Email notifications for new applications
- Application status tracking for users
- Advanced reporting and analytics
- Bulk export of applications
- Custom form templates
- Conditional question display logic

---

**Congratulations!** Your dynamic forms system is ready to use. The system provides a powerful, flexible solution for managing applications while maintaining a beautiful user experience.
