import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { supabase } from '../../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function VolunteerApplicationModal({ isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const { member } = useMemberAuth();
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    skills: '',
    availability: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        full_name: member.full_name || '',
        email: member.email || '',
        phone: member.phone || '',
        skills: '',
        availability: '',
        message: '',
      });
    }
  }, [member, isOpen]);

  const t = {
    en: {
      title: 'Volunteer With Us',
      subtitle: 'Make a difference in your community',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      skills: 'Skills & Experience',
      availability: 'Availability',
      message: 'Why do you want to volunteer?',
      submit: 'Submit Application',
      close: 'Close',
      success: 'Thank you for your interest! We will contact you soon.',
      error: 'Something went wrong. Please try again.',
    },
    ar: {
      title: 'تطوع معنا',
      subtitle: 'أحدث فرقاً في مجتمعك',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      skills: 'المهارات والخبرات',
      availability: 'الوقت المتاح',
      message: 'لماذا تريد التطوع؟',
      submit: 'إرسال الطلب',
      close: 'إغلاق',
      success: 'شكراً لاهتمامك! سنتواصل معك قريباً.',
      error: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    },
  };

  const text = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('volunteers').insert([
        {
          ...formData,
          status: 'pending',
          user_id: member?.id || null,
        },
      ]);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          skills: '',
          availability: '',
          message: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting volunteer application:', error);
      alert(text.error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="sticky top-0 bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 rounded-t-2xl z-10">
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white hover:bg-white/20 rounded-full p-2 transition-colors`}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2">{text.title}</h2>
            <p className="text-rose-100 text-sm">{text.subtitle}</p>
          </div>

          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg text-gray-900 font-semibold">{text.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {text.fullName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {text.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {text.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {text.skills} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {text.availability} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-colors"
                    placeholder="e.g., Weekends, Evenings"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {text.message} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-rose-600 to-rose-700 text-white py-4 rounded-xl hover:from-rose-700 hover:to-rose-800 transition-all font-semibold shadow-lg disabled:opacity-50"
                >
                  {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') : text.submit}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
