import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MembershipApplicationModal({ isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const { member } = useMemberAuth();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const t = {
    en: {
      title: 'Become a Member',
      subtitle: 'Join our community today',
      alreadyMember: 'Already have an account?',
      signIn: 'Sign In',
      notMember: 'New to our community?',
      register: 'Create Account',
      loggedIn: 'Welcome back',
      proceed: 'Proceed to Membership',
      close: 'Close',
    },
    ar: {
      title: 'كن عضواً',
      subtitle: 'انضم إلى مجتمعنا اليوم',
      alreadyMember: 'لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      notMember: 'جديد في مجتمعنا؟',
      register: 'إنشاء حساب',
      loggedIn: 'مرحباً بعودتك',
      proceed: 'متابعة للعضوية',
      close: 'إغلاق',
    },
  };

  const text = t[language];

  const handleProceed = () => {
    onClose();
    if (member) {
      navigate('/member/dashboard');
    } else {
      navigate('/membership');
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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl z-10">
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white hover:bg-white/20 rounded-full p-2 transition-colors`}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2">{text.title}</h2>
            <p className="text-emerald-100 text-sm">{text.subtitle}</p>
          </div>

          <div className="p-6 space-y-6">
            {member ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{text.loggedIn}</h3>
                  <p className="text-gray-600">{member.full_name || member.email}</p>
                </div>
                <button
                  onClick={handleProceed}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold shadow-lg"
                >
                  {text.proceed}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 transition-colors">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{text.notMember}</h3>
                  <p className="text-gray-600 text-sm mb-4">Create an account to access all membership benefits</p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/member/signup');
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold"
                  >
                    {text.register}
                  </button>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 transition-colors">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{text.alreadyMember}</h3>
                  <p className="text-gray-600 text-sm mb-4">Sign in to continue with your membership application</p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/member/login');
                    }}
                    className="w-full bg-white text-emerald-700 border-2 border-emerald-700 py-3 rounded-xl hover:bg-emerald-50 transition-all font-semibold"
                  >
                    {text.signIn}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
