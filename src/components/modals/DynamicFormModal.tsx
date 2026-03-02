import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Upload, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';
import { getFallbackQuestions } from '../../data/formQuestions';

interface FormQuestion {
  id: string;
  form_type: string;
  question_text_en: string;
  question_text_ar: string;
  question_type: string;
  options: Array<{ value: string; label_en: string; label_ar: string }>;
  placeholder_en?: string;
  placeholder_ar?: string;
  is_required: boolean;
  validation_rules: Record<string, any>;
  order_index: number;
  section?: string;
}

interface DynamicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: 'volunteer' | 'partnership' | 'job_application';
  title: string;
  titleAr: string;
  onSubmit: (data: Record<string, any>, responses: Array<{ question_id: string; response_text: string; response_files?: any[] }>) => Promise<void>;
  defaultData?: Record<string, any>;
  jobPostingId?: string;
}

export default function DynamicFormModal({
  isOpen,
  onClose,
  formType,
  title,
  titleAr,
  onSubmit,
  defaultData = {},
  jobPostingId
}: DynamicFormModalProps) {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
      setFormData(defaultData);
      setCurrentStep(0);
      setErrors({});
    }
  }, [isOpen, formType, jobPostingId]);

  const loadQuestions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('form_questions')
        .select('*')
        .eq('form_type', formType)
        .eq('is_active', true)
        .order('order_index');

      if (error || !data || data.length === 0) {
        const fallback = getFallbackQuestions(formType);
        setQuestions(fallback as any);
      } else {
        setQuestions(data);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      const fallback = getFallbackQuestions(formType);
      setQuestions(fallback as any);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (question: FormQuestion, value: any): string | null => {
    const isEmpty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0);

    if (question.is_required && isEmpty) {
      return language === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required';
    }

    if (question.validation_rules) {
      const rules = question.validation_rules;

      if (rules.min && value && value.length < rules.min) {
        return language === 'ar'
          ? `الحد الأدنى ${rules.min} أحرف`
          : `Minimum ${rules.min} characters`;
      }

      if (rules.max && value && value.length > rules.max) {
        return language === 'ar'
          ? `الحد الأقصى ${rules.max} أحرف`
          : `Maximum ${rules.max} characters`;
      }

      if (rules.pattern && value && !new RegExp(rules.pattern).test(value)) {
        return language === 'ar' ? 'صيغة غير صحيحة' : 'Invalid format';
      }
    }

    return null;
  };

  const handleFileUpload = async (questionId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    setUploadingFiles(prev => ({ ...prev, [questionId]: true }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${formType}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('wakala-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('wakala-documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        [questionId]: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(language === 'ar' ? 'فشل رفع الملف' : 'File upload failed');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const renderField = (question: FormQuestion) => {
    const questionText = language === 'ar' ? question.question_text_ar : question.question_text_en;
    const placeholder = language === 'ar' ? question.placeholder_ar : question.placeholder_en;
    const value = formData[question.id] || '';
    const error = errors[question.id];

    // Volunteer form: "Areas of Interest" should be free text (no fixed checkboxes).
    // We enforce this on the front-end so even if the DB question is still configured as checkboxes,
    // users will type their interests instead of picking a limited list.
    const normalizedEn = (question.question_text_en || '').trim().toLowerCase();
    const isVolunteerAreasOfInterest =
      formType === 'volunteer' &&
      (question.id === 'v6' || normalizedEn === 'areas of interest');

    const effectiveType = isVolunteerAreasOfInterest ? 'textarea' : question.question_type;
    const effectivePlaceholder =
      placeholder ||
      (isVolunteerAreasOfInterest
        ? language === 'ar'
          ? 'اكتب مجالات التطوع التي ترغب بها (مثال: التعليم، دعم الشباب، الفعاليات، جمع التبرعات…)'
          : 'Write the areas you would like to volunteer in (e.g., education programme, youth support, events, fundraising…)'
        : undefined);

    const commonClasses = `w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all`;

    switch (effectiveType) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={effectivePlaceholder}
            className={`${commonClasses} min-h-[120px] resize-y`}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            className={commonClasses}
          >
            <option value="">{placeholder}</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {language === 'ar' ? option.label_ar : option.label_en}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
                  className="w-5 h-5 text-primary focus:ring-primary"
                />
                <span className="group-hover:text-primary transition-colors">
                  {language === 'ar' ? option.label_ar : option.label_en}
                </span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option.value);
                    } else {
                      const index = newValue.indexOf(option.value);
                      if (index > -1) newValue.splice(index, 1);
                    }
                    setFormData(prev => ({ ...prev, [question.id]: newValue }));
                  }}
                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                />
                <span className="group-hover:text-primary transition-colors">
                  {language === 'ar' ? option.label_ar : option.label_en}
                </span>
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <div>
            <label className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-sand transition-all">
              {uploadingFiles[question.id] ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>{language === 'ar' ? 'جاري الرفع...' : 'Uploading...'}</span>
                </>
              ) : value ? (
                <>
                  <FileText size={24} className="text-primary" />
                  <span className="text-primary">{language === 'ar' ? 'تم رفع الملف' : 'File uploaded'}</span>
                </>
              ) : (
                <>
                  <Upload size={24} />
                  <span>{language === 'ar' ? 'اختر ملف' : 'Choose file'}</span>
                </>
              )}
              <input
                type="file"
                onChange={(e) => e.target.files && handleFileUpload(question.id, e.target.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            className={commonClasses}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={placeholder}
            className={commonClasses}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={placeholder}
            className={commonClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={placeholder}
            className={commonClasses}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setFormData(prev => ({ ...prev, [question.id]: e.target.value }))}
            placeholder={placeholder}
            className={commonClasses}
          />
        );
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentQuestion = questions[currentStep];
    if (!currentQuestion) return true;

    const error = validateField(currentQuestion, formData[currentQuestion.id]);
    if (error) {
      setErrors({ [currentQuestion.id]: error });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const responses = questions.map(q => ({
        question_id: q.id,
        response_text: Array.isArray(formData[q.id])
          ? formData[q.id].join(', ')
          : formData[q.id]?.toString() || '',
        response_files: q.question_type === 'file' ? [formData[q.id]] : []
      }));

      await onSubmit(formData, responses);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء الإرسال' : 'An error occurred during submission');
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  const isLastStep = currentStep === questions.length - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-2">
                {language === 'ar' ? titleAr : title}
              </h2>

              <div className="mt-4">
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-sm mt-2 opacity-90">
                  {language === 'ar'
                    ? `سؤال ${currentStep + 1} من ${questions.length}`
                    : `Question ${currentStep + 1} of ${questions.length}`
                  }
                </p>
              </div>
            </div>

            <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary" size={48} />
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted">
                    {language === 'ar'
                      ? 'لا توجد أسئلة متاحة حالياً'
                      : 'No questions available at the moment'}
                  </p>
                </div>
              ) : currentQuestion ? (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <label className="block">
                    <span className="text-lg font-semibold text-primary mb-3 block">
                      {language === 'ar' ? currentQuestion.question_text_ar : currentQuestion.question_text_en}
                      {currentQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    {renderField(currentQuestion)}
                    {errors[currentQuestion.id] && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-2 block"
                      >
                        {errors[currentQuestion.id]}
                      </motion.span>
                    )}
                  </label>
                </motion.div>
              ) : null}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-8 py-6 flex justify-between items-center border-t">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-6 py-3 text-primary hover:bg-sand rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {language === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>

              {isLastStep ? (
                <motion.button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      {language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {language === 'ar' ? 'إرسال' : 'Submit'}
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                  {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
