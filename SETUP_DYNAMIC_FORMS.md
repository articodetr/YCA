# إعداد نظام النماذج الديناميكية | Dynamic Forms System Setup

## خطوات الإعداد المطلوبة | Required Setup Steps

### 1. تشغيل سكريبت قاعدة البيانات | Run Database Script

يجب تشغيل سكريبت SQL التالي في لوحة Supabase SQL Editor لإنشاء الجداول المطلوبة:

You need to run the following SQL script in your Supabase SQL Editor to create the required tables:

**الخطوات | Steps:**
1. افتح مشروع Supabase الخاص بك | Open your Supabase project
2. انتقل إلى SQL Editor | Go to SQL Editor
3. أنشئ استعلام جديد | Create a new query
4. انسخ والصق السكريبت أدناه | Copy and paste the script below
5. قم بتشغيل الاستعلام | Run the query

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

-- Insert default job application questions
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, order_index, section) VALUES
('job_application', 'Why are you interested in this position?', 'لماذا أنت مهتم بهذا المنصب؟', 'textarea', 'Tell us why you want to join our team...', 'أخبرنا لماذا تريد الانضمام إلى فريقنا...', true, 1, 'motivation'),
('job_application', 'What relevant experience do you have?', 'ما هي الخبرة ذات الصلة التي لديك؟', 'textarea', 'Describe your relevant work experience...', 'صف خبرتك العملية ذات الصلة...', true, 2, 'experience'),
('job_application', 'When can you start?', 'متى يمكنك البدء؟', 'select', 'Select your availability', 'حدد توفرك', true, 3, 'availability')
ON CONFLICT DO NOTHING;

-- Add options for start date
UPDATE form_questions
SET options = '[
  {"value": "immediately", "label_en": "Immediately", "label_ar": "فوراً"},
  {"value": "one_week", "label_en": "Within 1 week", "label_ar": "خلال أسبوع"},
  {"value": "two_weeks", "label_en": "Within 2 weeks", "label_ar": "خلال أسبوعين"},
  {"value": "one_month", "label_en": "Within 1 month", "label_ar": "خلال شهر"},
  {"value": "negotiable", "label_en": "Negotiable", "label_ar": "قابل للتفاوض"}
]'::jsonb
WHERE form_type = 'job_application' AND question_text_en = 'When can you start?';

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

### 2. التحقق من التثبيت | Verify Installation

بعد تشغيل السكريبت، تحقق من أن الجداول تم إنشاؤها بنجاح:

After running the script, verify that the tables were created successfully:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('form_questions', 'form_responses', 'job_postings', 'job_applications');
```

يجب أن ترى 4 جداول في النتيجة.

You should see 4 tables in the result.

### 3. كيفية الاستخدام | How to Use

#### للزوار | For Visitors:

1. **طلبات التطوع | Volunteer Applications**
   - زيارة `/get-involved/volunteer`
   - النقر على زر "ابدأ التطوع" أو "Start Volunteering"
   - تعبئة النموذج خطوة بخطوة

2. **طلبات الشراكة | Partnership Inquiries**
   - زيارة `/get-involved/partnerships`
   - النقر على زر "ابدأ طلب الشراكة" أو "Start Partnership Application"
   - تعبئة النموذج خطوة بخطوة

3. **طلبات الوظائف | Job Applications**
   - زيارة `/get-involved/jobs`
   - النقر على "قدم الآن" أو "Apply Now" على أي وظيفة
   - تعبئة النموذج خطوة بخطوة

#### للمسؤولين | For Admins:

1. **إدارة الأسئلة | Manage Questions**
   - الانتقال إلى `/admin/form-questions`
   - إضافة، تعديل، أو حذف الأسئلة
   - ترتيب الأسئلة بالسحب والإفلات
   - تفعيل أو تعطيل الأسئلة

2. **إدارة الوظائف | Manage Job Postings**
   - الانتقال إلى `/admin/job-postings`
   - إضافة وظائف جديدة
   - تعديل الوظائف الموجودة
   - عرض طلبات التقديم

3. **عرض الطلبات | View Applications**
   - التطوع: `/admin/volunteers`
   - الشراكات: `/admin/partnerships`
   - الوظائف: من صفحة إدارة الوظائف

## المميزات | Features

✅ نظام نماذج ديناميكي قابل للتخصيص | Customizable dynamic forms system
✅ دعم ثنائي اللغة (العربية/الإنجليزية) | Bilingual support (Arabic/English)
✅ 10 أنواع من الأسئلة | 10 question types
✅ تنقل خطوة بخطوة | Step-by-step navigation
✅ مؤشر التقدم | Progress indicator
✅ رفع الملفات | File uploads
✅ التحقق من صحة الإدخال | Input validation
✅ واجهة إدارية سهلة | Easy admin interface

## أنواع الأسئلة المدعومة | Supported Question Types

1. نص | Text
2. نص متعدد الأسطر | Textarea
3. اختيار من قائمة | Select
4. اختيار واحد | Radio
5. اختيار متعدد | Checkbox
6. تاريخ | Date
7. ملف | File
8. بريد إلكتروني | Email
9. هاتف | Phone
10. رقم | Number

---

## الدعم | Support

إذا واجهت أي مشاكل، يرجى التحقق من:

If you encounter any issues, please check:

1. تم تشغيل السكريبت بنجاح في Supabase | The script ran successfully in Supabase
2. تم إنشاء جميع الجداول | All tables were created
3. سياسات RLS مفعلة بشكل صحيح | RLS policies are enabled correctly
4. تم إنشاء storage bucket للسير الذاتية | The job-resumes storage bucket was created
