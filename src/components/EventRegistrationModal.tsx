import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Mail, Phone, Users, FileText, Award, Loader2,
  CheckCircle, AlertCircle, ShieldCheck,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface EventRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  eventCategory?: string;
  maxCapacity?: number;
  currentRegistrations?: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  numberOfAttendees: number;
  notes: string;
  skills: string;
  isMember: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  numberOfAttendees?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

const translations = {
  ar: {
    title: 'تسجيل في الحدث',
    firstName: 'الاسم الأول *',
    lastName: 'اسم العائلة *',
    email: 'البريد الإلكتروني *',
    emailPlaceholder: 'your.email@example.com',
    phoneLbl: 'رقم الهاتف *',
    phonePlaceholder: '07123 456789',
    memberQuestion: 'هل أنت عضو مسجل في YCA؟',
    yes: 'نعم',
    no: 'لا',
    attendees: 'عدد الحضور *',
    skills: 'المهارات (اختياري)',
    skillsPlaceholder: 'أخبرنا عن أي مهارات لديك قد تكون مفيدة',
    notes: 'ملاحظات إضافية (اختياري)',
    notesPlaceholder: 'أي متطلبات خاصة أو أسئلة',
    emergencyTitle: 'جهة اتصال الطوارئ (مطلوبة لهذا الحدث)',
    emergencyName: 'اسم جهة الاتصال *',
    emergencyPhone: 'هاتف جهة الاتصال *',
    cancel: 'إلغاء',
    register: 'تسجيل',
    submitting: 'جاري التسجيل...',
    successTitle: 'تم التسجيل بنجاح!',
    successMsg: 'شكراً لتسجيلك. نتطلع لرؤيتك في الحدث!',
    fullyBooked: 'هذا الحدث مكتمل العدد',
    fullyBookedMsg: 'يرجى التحقق لاحقاً أو الاتصال بنا لخيارات قائمة الانتظار.',
    required: 'مطلوب',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صالح',
    minAttendees: 'يجب أن يكون عدد الحضور 1 على الأقل',
    spotsLeft: 'أماكن متبقية فقط. يرجى تقليل عدد الحضور.',
    freeEvent: 'مجاني',
  },
  en: {
    title: 'Event Registration',
    firstName: 'First Name *',
    lastName: 'Last Name *',
    email: 'Email Address *',
    emailPlaceholder: 'your.email@example.com',
    phoneLbl: 'Phone Number *',
    phonePlaceholder: '07123 456789',
    memberQuestion: 'Are you a registered YCA member?',
    yes: 'Yes',
    no: 'No',
    attendees: 'Number of Attendees *',
    skills: 'Skills (Optional)',
    skillsPlaceholder: 'Tell us about any skills you have that might be helpful',
    notes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Any special requirements or questions you may have',
    emergencyTitle: 'Emergency Contact (Required for this event)',
    emergencyName: 'Contact Name *',
    emergencyPhone: 'Contact Phone *',
    cancel: 'Cancel',
    register: 'Register',
    submitting: 'Submitting...',
    successTitle: 'Registration Successful!',
    successMsg: 'Thank you for registering. We look forward to seeing you at the event!',
    fullyBooked: 'This event is fully booked',
    fullyBookedMsg: 'Please check back later or contact us for waitlist options.',
    required: 'Required',
    invalidEmail: 'Please enter a valid email address',
    minAttendees: 'Number of attendees must be at least 1',
    spotsLeft: 'spot(s) remaining. Please reduce the number of attendees.',
    freeEvent: 'Free',
  },
};

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  numberOfAttendees: 1,
  notes: '',
  skills: '',
  isMember: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
};

export default function EventRegistrationModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  eventCategory,
  maxCapacity,
  currentRegistrations,
}: EventRegistrationModalProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translations[language];

  const requiresEmergencyContact = eventCategory === 'children' || eventCategory === 'youth';
  const isFull = maxCapacity && currentRegistrations !== undefined && currentRegistrations >= maxCapacity;

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setErrors({});
      setSubmitSuccess(false);
      setSubmitError('');
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = t.required;
    if (!formData.lastName.trim()) newErrors.lastName = t.required;
    if (!formData.email.trim()) {
      newErrors.email = t.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }
    if (!formData.phone.trim()) newErrors.phone = t.required;
    if (formData.numberOfAttendees < 1) newErrors.numberOfAttendees = t.minAttendees;

    if (requiresEmergencyContact) {
      if (!formData.emergencyContactName.trim()) newErrors.emergencyContactName = t.required;
      if (!formData.emergencyContactPhone.trim()) newErrors.emergencyContactPhone = t.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      if (maxCapacity && currentRegistrations !== undefined) {
        const spotsLeft = maxCapacity - currentRegistrations;
        if (formData.numberOfAttendees > spotsLeft) {
          setSubmitError(
            spotsLeft > 0
              ? `${spotsLeft} ${t.spotsLeft}`
              : t.fullyBooked
          );
          setIsSubmitting(false);
          return;
        }
      }

      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
      const bookingRef = 'EVT' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

      const insertData: Record<string, unknown> = {
        event_id: eventId,
        full_name: fullName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        number_of_attendees: formData.numberOfAttendees,
        notes: formData.notes.trim() || null,
        skills: formData.skills.trim() || null,
        status: 'confirmed',
        booking_reference: bookingRef,
      };

      if (formData.isMember === 'yes') {
        insertData.is_member = true;
      } else if (formData.isMember === 'no') {
        insertData.is_member = false;
      }

      if (formData.emergencyContactName.trim()) {
        insertData.emergency_contact_name = formData.emergencyContactName.trim();
      }
      if (formData.emergencyContactPhone.trim()) {
        insertData.emergency_contact_phone = formData.emergencyContactPhone.trim();
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert(insertData);

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || error.details || 'Database error');
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Registration error:', err);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfAttendees' ? parseInt(value) || 1 : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (submitError) setSubmitError('');
  };

  if (!isOpen) return null;

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
            <p className="text-gray-600 mb-6">{t.successMsg}</p>
            <button
              onClick={onClose}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">{t.title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2">
              <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-emerald-600 font-medium">{t.title}</p>
                  <p className="font-semibold text-emerald-800 text-sm truncate">{eventTitle}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-700">{t.freeEvent}</span>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="mx-6 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 flex-1">{submitError}</p>
                <button onClick={() => setSubmitError('')} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {isFull && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <p className="text-red-700 font-semibold">{t.fullyBooked}</p>
                  <p className="text-red-600 text-sm mt-1">{t.fullyBookedMsg}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.firstName}</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.lastName}</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.lastName ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-3.5 h-3.5" /> {t.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t.emailPlaceholder}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-3.5 h-3.5" /> {t.phoneLbl}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.phonePlaceholder}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.memberQuestion}</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isMember"
                        value="yes"
                        checked={formData.isMember === 'yes'}
                        onChange={handleChange}
                        className="text-emerald-600"
                      />
                      <span className="text-sm">{t.yes}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="isMember"
                        value="no"
                        checked={formData.isMember === 'no'}
                        onChange={handleChange}
                        className="text-emerald-600"
                      />
                      <span className="text-sm">{t.no}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    <Users className="w-3.5 h-3.5" /> {t.attendees}
                  </label>
                  <input
                    type="number"
                    name="numberOfAttendees"
                    value={formData.numberOfAttendees}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.numberOfAttendees ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.numberOfAttendees && <p className="text-red-500 text-xs mt-1">{errors.numberOfAttendees}</p>}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    <Award className="w-3.5 h-3.5" /> {t.skills}
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows={2}
                    placeholder={t.skillsPlaceholder}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                {requiresEmergencyContact && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-amber-800">{t.emergencyTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.emergencyName}</label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleChange}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.emergencyContactName ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.emergencyPhone}</label>
                        <input
                          type="tel"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleChange}
                          className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm ${errors.emergencyContactPhone ? 'border-red-400' : 'border-gray-300'}`}
                        />
                        {errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-3.5 h-3.5" /> {t.notes}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder={t.notesPlaceholder}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
                  disabled={isSubmitting}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isSubmitting || !!isFull}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    t.register
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
