export interface FallbackQuestion {
  id: string;
  form_type: string;
  question_text_en: string;
  question_text_ar: string;
  question_type: string;
  options: Array<{ value: string; label_en: string; label_ar: string }>;
  placeholder_en: string;
  placeholder_ar: string;
  is_required: boolean;
  validation_rules: Record<string, any>;
  order_index: number;
  section: string;
}

export const volunteerQuestions: FallbackQuestion[] = [
  {
    id: 'v1', form_type: 'volunteer', question_text_en: 'Full Name', question_text_ar: 'الاسم الكامل',
    question_type: 'text', options: [], placeholder_en: 'Enter your full name', placeholder_ar: 'أدخل اسمك الكامل',
    is_required: true, validation_rules: {}, order_index: 1, section: 'personal',
  },
  {
    id: 'v2', form_type: 'volunteer', question_text_en: 'Email Address', question_text_ar: 'البريد الإلكتروني',
    question_type: 'email', options: [], placeholder_en: 'Enter your email', placeholder_ar: 'أدخل بريدك الإلكتروني',
    is_required: true, validation_rules: {}, order_index: 2, section: 'personal',
  },
  {
    id: 'v3', form_type: 'volunteer', question_text_en: 'Phone Number', question_text_ar: 'رقم الهاتف',
    question_type: 'phone', options: [], placeholder_en: 'Enter your phone number', placeholder_ar: 'أدخل رقم هاتفك',
    is_required: true, validation_rules: {}, order_index: 3, section: 'personal',
  },
  {
    id: 'v4', form_type: 'volunteer', question_text_en: 'Date of Birth', question_text_ar: 'تاريخ الميلاد',
    question_type: 'date', options: [], placeholder_en: '', placeholder_ar: '',
    is_required: false, validation_rules: {}, order_index: 4, section: 'personal',
  },
  {
    id: 'v5', form_type: 'volunteer', question_text_en: 'Address', question_text_ar: 'العنوان',
    question_type: 'text', options: [], placeholder_en: 'Enter your address', placeholder_ar: 'أدخل عنوانك',
    is_required: false, validation_rules: {}, order_index: 5, section: 'personal',
  },
  {
    id: 'v6', form_type: 'volunteer', question_text_en: 'Areas of Interest', question_text_ar: 'مجالات الاهتمام',
    // Free text (instead of fixed checkboxes) so volunteers can describe interests in their own words.
    question_type: 'textarea',
    options: [],
    placeholder_en: 'Write the areas you would like to volunteer in (e.g., education programme, youth support, events, fundraising…)',
    placeholder_ar: 'اكتب مجالات التطوع التي ترغب بها (مثال: التعليم، دعم الشباب، الفعاليات، جمع التبرعات…)',
    is_required: true, validation_rules: {}, order_index: 6, section: 'interests',
  },
  {
    id: 'v7', form_type: 'volunteer', question_text_en: 'Skills & Qualifications', question_text_ar: 'المهارات والمؤهلات',
    question_type: 'textarea', options: [], placeholder_en: 'Describe your skills and qualifications', placeholder_ar: 'صف مهاراتك ومؤهلاتك',
    is_required: false, validation_rules: {}, order_index: 7, section: 'skills',
  },
  {
    id: 'v8', form_type: 'volunteer', question_text_en: 'Previous Volunteer Experience', question_text_ar: 'خبرة التطوع السابقة',
    question_type: 'textarea', options: [], placeholder_en: 'Describe any previous volunteer experience', placeholder_ar: 'صف أي خبرة تطوعية سابقة',
    is_required: false, validation_rules: {}, order_index: 8, section: 'experience',
  },
  {
    id: 'v9', form_type: 'volunteer', question_text_en: 'Why do you want to volunteer?', question_text_ar: 'لماذا تريد التطوع؟',
    question_type: 'textarea', options: [], placeholder_en: 'Tell us why you want to volunteer with YCA', placeholder_ar: 'أخبرنا لماذا تريد التطوع مع الجمعية',
    is_required: true, validation_rules: {}, order_index: 9, section: 'motivation',
  },
  {
    id: 'v10', form_type: 'volunteer', question_text_en: 'Availability', question_text_ar: 'التوفر',
    question_type: 'select', options: [
      { value: 'weekday_mornings', label_en: 'Weekday Mornings', label_ar: 'صباح أيام الأسبوع' },
      { value: 'weekday_afternoons', label_en: 'Weekday Afternoons', label_ar: 'بعد ظهر أيام الأسبوع' },
      { value: 'weekday_evenings', label_en: 'Weekday Evenings', label_ar: 'مساء أيام الأسبوع' },
      { value: 'weekends', label_en: 'Weekends', label_ar: 'عطلة نهاية الأسبوع' },
      { value: 'flexible', label_en: 'Flexible', label_ar: 'مرن' },
    ],
    placeholder_en: 'Select your availability', placeholder_ar: 'اختر توفرك',
    is_required: true, validation_rules: {}, order_index: 10, section: 'availability',
  },
  {
    id: 'v11', form_type: 'volunteer', question_text_en: 'Emergency Contact Name', question_text_ar: 'اسم جهة الاتصال للطوارئ',
    question_type: 'text', options: [], placeholder_en: 'Emergency contact name', placeholder_ar: 'اسم جهة اتصال الطوارئ',
    is_required: false, validation_rules: {}, order_index: 11, section: 'emergency',
  },
  {
    id: 'v12', form_type: 'volunteer', question_text_en: 'Emergency Contact Phone', question_text_ar: 'رقم هاتف الطوارئ',
    question_type: 'phone', options: [], placeholder_en: 'Emergency contact phone', placeholder_ar: 'رقم هاتف الطوارئ',
    is_required: false, validation_rules: {}, order_index: 12, section: 'emergency',
  },
];

export const partnershipQuestions: FallbackQuestion[] = [
  {
    id: 'p1', form_type: 'partnership', question_text_en: 'Organisation Name', question_text_ar: 'اسم المنظمة',
    question_type: 'text', options: [], placeholder_en: 'Enter organisation name', placeholder_ar: 'أدخل اسم المنظمة',
    is_required: true, validation_rules: {}, order_index: 1, section: 'organisation',
  },
  {
    id: 'p2', form_type: 'partnership', question_text_en: 'Contact Person Name', question_text_ar: 'اسم جهة الاتصال',
    question_type: 'text', options: [], placeholder_en: 'Enter contact person name', placeholder_ar: 'أدخل اسم جهة الاتصال',
    is_required: true, validation_rules: {}, order_index: 2, section: 'contact',
  },
  {
    id: 'p3', form_type: 'partnership', question_text_en: 'Email Address', question_text_ar: 'البريد الإلكتروني',
    question_type: 'email', options: [], placeholder_en: 'Enter email address', placeholder_ar: 'أدخل البريد الإلكتروني',
    is_required: true, validation_rules: {}, order_index: 3, section: 'contact',
  },
  {
    id: 'p4', form_type: 'partnership', question_text_en: 'Phone Number', question_text_ar: 'رقم الهاتف',
    question_type: 'phone', options: [], placeholder_en: 'Enter phone number', placeholder_ar: 'أدخل رقم الهاتف',
    is_required: true, validation_rules: {}, order_index: 4, section: 'contact',
  },
  {
    id: 'p5', form_type: 'partnership', question_text_en: 'Organisation Type', question_text_ar: 'نوع المنظمة',
    question_type: 'select', options: [
      { value: 'charity', label_en: 'Charity / Non-Profit', label_ar: 'جمعية خيرية / غير ربحية' },
      { value: 'government', label_en: 'Government / Public Sector', label_ar: 'حكومي / قطاع عام' },
      { value: 'private', label_en: 'Private Business', label_ar: 'أعمال خاصة' },
      { value: 'education', label_en: 'Educational Institution', label_ar: 'مؤسسة تعليمية' },
      { value: 'community', label_en: 'Community Group', label_ar: 'مجموعة مجتمعية' },
      { value: 'other', label_en: 'Other', label_ar: 'أخرى' },
    ],
    placeholder_en: 'Select organisation type', placeholder_ar: 'اختر نوع المنظمة',
    is_required: true, validation_rules: {}, order_index: 5, section: 'organisation',
  },
  {
    id: 'p6', form_type: 'partnership', question_text_en: 'Partnership Interest', question_text_ar: 'مجال الشراكة المطلوب',
    question_type: 'select', options: [
      { value: 'funding', label_en: 'Funding & Grants', label_ar: 'تمويل ومنح' },
      { value: 'joint_events', label_en: 'Joint Events', label_ar: 'فعاليات مشتركة' },
      { value: 'service_delivery', label_en: 'Service Delivery', label_ar: 'تقديم خدمات' },
      { value: 'training', label_en: 'Training & Capacity Building', label_ar: 'تدريب وبناء قدرات' },
      { value: 'resource_sharing', label_en: 'Resource Sharing', label_ar: 'مشاركة الموارد' },
      { value: 'other', label_en: 'Other', label_ar: 'أخرى' },
    ],
    placeholder_en: 'Select partnership interest', placeholder_ar: 'اختر مجال الشراكة',
    is_required: true, validation_rules: {}, order_index: 6, section: 'partnership',
  },
  {
    id: 'p7', form_type: 'partnership', question_text_en: 'How can your organisation contribute?', question_text_ar: 'كيف يمكن لمنظمتكم المساهمة؟',
    question_type: 'textarea', options: [], placeholder_en: 'Describe how your organisation can contribute to our community', placeholder_ar: 'صف كيف يمكن لمنظمتكم المساهمة في مجتمعنا',
    is_required: true, validation_rules: {}, order_index: 7, section: 'partnership',
  },
];

export function getFallbackQuestions(formType: string): FallbackQuestion[] {
  switch (formType) {
    case 'volunteer': return volunteerQuestions;
    case 'partnership': return partnershipQuestions;
    default: return [];
  }
}
