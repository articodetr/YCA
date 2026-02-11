-- Seed Form Questions for Volunteer and Partnership Forms
-- Run this in Supabase SQL Editor to populate the form_questions table

-- Delete existing questions to avoid duplicates (optional)
-- DELETE FROM form_questions WHERE form_type IN ('volunteer', 'partnership');

-- Volunteer Form Questions (Basic Fields)
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, validation_rules, order_index, section) VALUES
('volunteer', 'Full Name', 'الاسم الكامل', 'text', 'Enter your full name', 'أدخل اسمك الكامل', true, '{"min": 3, "max": 100}', 1, 'basic'),
('volunteer', 'Email Address', 'البريد الإلكتروني', 'email', 'your.email@example.com', 'your.email@example.com', true, '{"pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"}', 2, 'basic'),
('volunteer', 'Phone Number', 'رقم الهاتف', 'phone', '+44 xxx xxx xxxx', '+44 xxx xxx xxxx', true, '{"min": 10, "max": 20}', 3, 'basic'),
('volunteer', 'Address', 'العنوان', 'textarea', 'Enter your full address', 'أدخل عنوانك الكامل', true, '{"min": 10, "max": 300}', 4, 'basic'),
('volunteer', 'Date of Birth', 'تاريخ الميلاد', 'date', '', '', true, '{}', 5, 'basic'),
('volunteer', 'Emergency Contact Name', 'اسم جهة اتصال الطوارئ', 'text', 'Name of emergency contact', 'اسم جهة اتصال الطوارئ', true, '{"min": 3, "max": 100}', 6, 'basic'),
('volunteer', 'Emergency Contact Phone', 'هاتف جهة اتصال الطوارئ', 'phone', '+44 xxx xxx xxxx', '+44 xxx xxx xxxx', true, '{"min": 10, "max": 20}', 7, 'basic');

-- Volunteer Form Questions (Additional Fields)
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, validation_rules, order_index, section) VALUES
('volunteer', 'Areas of Interest', 'مجالات الاهتمام', 'textarea', 'What areas are you interested in volunteering?', 'ما هي المجالات التي تهتم بالتطوع فيها؟', false, '{"max": 500}', 10, 'details'),
('volunteer', 'Skills and Experience', 'المهارات والخبرات', 'textarea', 'Tell us about your relevant skills and experience', 'أخبرنا عن مهاراتك وخبراتك ذات الصلة', false, '{"max": 500}', 11, 'details'),
('volunteer', 'Availability', 'التوفر', 'select', '', '', false, '{}', 12, 'details'),
('volunteer', 'Previous Volunteering Experience', 'الخبرة السابقة في التطوع', 'textarea', 'Describe any previous volunteering experience', 'صف أي خبرة سابقة في التطوع', false, '{"max": 500}', 13, 'details'),
('volunteer', 'Why do you want to volunteer with us?', 'لماذا تريد التطوع معنا؟', 'textarea', 'Tell us why you want to volunteer', 'أخبرنا لماذا تريد التطوع معنا', false, '{"max": 500}', 14, 'details');

-- Add options for Availability select field
UPDATE form_questions
SET options = '[
  {"value": "weekdays", "label_en": "Weekdays", "label_ar": "أيام الأسبوع"},
  {"value": "weekends", "label_en": "Weekends", "label_ar": "عطلات نهاية الأسبوع"},
  {"value": "evenings", "label_en": "Evenings", "label_ar": "المساء"},
  {"value": "flexible", "label_en": "Flexible", "label_ar": "مرن"}
]'::jsonb
WHERE form_type = 'volunteer' AND question_text_en = 'Availability';

-- Partnership Form Questions (Basic Fields)
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, validation_rules, order_index, section) VALUES
('partnership', 'Organization Name', 'اسم المنظمة', 'text', 'Enter organization name', 'أدخل اسم المنظمة', true, '{"min": 3, "max": 200}', 1, 'basic'),
('partnership', 'Contact Person Name', 'اسم الشخص المسؤول', 'text', 'Name of contact person', 'اسم الشخص المسؤول', true, '{"min": 3, "max": 100}', 2, 'basic'),
('partnership', 'Email Address', 'البريد الإلكتروني', 'email', 'your.email@example.com', 'your.email@example.com', true, '{"pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"}', 3, 'basic'),
('partnership', 'Phone Number', 'رقم الهاتف', 'phone', '+44 xxx xxx xxxx', '+44 xxx xxx xxxx', true, '{"min": 10, "max": 20}', 4, 'basic'),
('partnership', 'Additional Message', 'رسالة إضافية', 'textarea', 'Tell us more about your partnership interest', 'أخبرنا المزيد عن اهتمامك بالشراكة', false, '{"max": 1000}', 5, 'basic');

-- Partnership Form Questions (Additional Fields)
INSERT INTO form_questions (form_type, question_text_en, question_text_ar, question_type, placeholder_en, placeholder_ar, is_required, validation_rules, order_index, section) VALUES
('partnership', 'Organization Type', 'نوع المنظمة', 'select', '', '', true, '{}', 10, 'details'),
('partnership', 'Partnership Interest', 'نوع الشراكة المهتم بها', 'select', '', '', true, '{}', 11, 'details'),
('partnership', 'Organization Website', 'الموقع الإلكتروني للمنظمة', 'text', 'https://example.com', 'https://example.com', false, '{}', 12, 'details'),
('partnership', 'How did you hear about us?', 'كيف سمعت عنا؟', 'textarea', 'Let us know how you heard about YCA', 'أخبرنا كيف سمعت عن YCA', false, '{"max": 300}', 13, 'details');

-- Add options for Organization Type
UPDATE form_questions
SET options = '[
  {"value": "corporate", "label_en": "Corporate/Business", "label_ar": "شركة/أعمال"},
  {"value": "charity", "label_en": "Charity/Non-profit", "label_ar": "جمعية خيرية/غير ربحية"},
  {"value": "public_sector", "label_en": "Public Sector", "label_ar": "القطاع العام"},
  {"value": "education", "label_en": "Educational Institution", "label_ar": "مؤسسة تعليمية"},
  {"value": "other", "label_en": "Other", "label_ar": "أخرى"}
]'::jsonb
WHERE form_type = 'partnership' AND question_text_en = 'Organization Type';

-- Add options for Partnership Interest
UPDATE form_questions
SET options = '[
  {"value": "funding", "label_en": "Funding/Grants", "label_ar": "تمويل/منح"},
  {"value": "collaboration", "label_en": "Programme Collaboration", "label_ar": "التعاون في البرامج"},
  {"value": "sponsorship", "label_en": "Event Sponsorship", "label_ar": "رعاية الفعاليات"},
  {"value": "services", "label_en": "Service Partnership", "label_ar": "شراكة في الخدمات"},
  {"value": "other", "label_en": "Other", "label_ar": "أخرى"}
]'::jsonb
WHERE form_type = 'partnership' AND question_text_en = 'Partnership Interest';
