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

export default function PartnershipModal({ isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const { member } = useMemberAuth();
  const isRTL = language === 'ar';

  const [formData, setFormData] = useState({
    organization_name: '',
    contact_name: '',
    email: '',
    phone: '',
    organization_type: '',
    partnership_interest: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        ...formData,
        contact_name: member.full_name || '',
        email: member.email || '',
        phone: member.phone || '',
      });
    }
  }, [member, isOpen]);

  const t = {
    en: {
      title: 'Partner With Us',
      subtitle: 'Collaborate for greater impact',
      organizationName: 'Organization Name',
      contactName: 'Contact Person',
      email: 'Email',
      phone: 'Phone Number',
      organizationType: 'Organization Type',
      partnershipInterest: 'Partnership Interest',
      message: 'Tell us about your partnership proposal',
      submit: 'Submit Proposal',
      close: 'Close',
      success: 'Thank you! We will review your proposal and get back to you soon.',
      error: 'Something went wrong. Please try again.',
      orgTypes: {
        business: 'Business',
        charity: 'Charity/NGO',
        education: 'Educational Institution',
        government: 'Government',
        other: 'Other',
      },
      interests: {
        funding: 'Funding & Sponsorship',
        services: 'Service Provision',
        collaboration: 'Programme Collaboration',
        volunteering: 'Corporate Volunteering',
        other: 'Other',
      },
    },
    ar: {
      title: 'شراكة معنا',
      subtitle: 'تعاون لتأثير أكبر',
      organizationName: 'اسم المؤسسة',
      contactName: 'الشخص المسؤول',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      organizationType: 'نوع المؤسسة',
      partnershipInterest: 'مجال الشراكة',
      message: 'أخبرنا عن مقترح الشراكة',
      submit: 'إرسال المقترح',
      close: 'إغلاق',
      success: 'شكراً! سنراجع مقترحك ونتواصل معك قريباً.',
      error: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      orgTypes: {
        business: 'شركة',
        charity: 'منظمة خيرية',
        education: 'مؤسسة تعليمية',
        government: 'حكومية',
        other: 'أخرى',
      },
      interests: {
        funding: 'التمويل والرعاية',
        services: 'تقديم الخدمات',
        collaboration: 'التعاون في البرامج',
        volunteering: 'التطوع المؤسسي',
        other: 'أخرى',
      },
    },
  };

  const text = t[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('partnerships').insert([
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
          organization_name: '',
          contact_name: '',
          email: '',
          phone: '',
          organization_type: '',
          partnership_interest: '',
          message: '',
        });
      }, 2000);
    } catch (error) {
      console.error('Error submitting partnership proposal:', error);
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
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl z-10">
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white hover:bg-white/20 rounded-full p-2 transition-colors`}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2">{text.title}</h2>
            <p className="text-blue-100 text-sm">{text.subtitle}</p>
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
                    {text.organizationName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {text.contactName} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {text.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {text.phone} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {text.organizationType} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.organization_type}
                      onChange={(e) => setFormData({ ...formData, organization_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                      required
                    >
                      <option value="">Select type</option>
                      {Object.entries(text.orgTypes).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {text.partnershipInterest} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.partnership_interest}
                    onChange={(e) => setFormData({ ...formData, partnership_interest: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                  >
                    <option value="">Select interest</option>
                    {Object.entries(text.interests).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {text.message} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg disabled:opacity-50"
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
