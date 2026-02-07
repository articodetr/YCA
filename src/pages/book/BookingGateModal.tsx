import { X, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

interface BookingGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberLogin: () => void;
  onContinueAsGuest: () => void;
}

const translations = {
  en: {
    title: 'How would you like to proceed?',
    memberTitle: 'I am a registered member',
    memberDesc: 'Sign in to auto-fill your details and get member benefits',
    guestTitle: 'Continue as guest',
    guestDesc: 'Proceed without signing in',
  },
  ar: {
    title: 'كيف تريد المتابعة؟',
    memberTitle: 'أنا عضو مسجل',
    memberDesc: 'سجّل دخولك لتعبئة بياناتك تلقائياً والحصول على مزايا العضوية',
    guestTitle: 'المتابعة كضيف',
    guestDesc: 'المتابعة بدون تسجيل الدخول',
  },
};

export default function BookingGateModal({ isOpen, onClose, onMemberLogin, onContinueAsGuest }: BookingGateModalProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = translations[language];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-[#1b2b45] to-[#2a4a6d] px-6 py-5">
              <h2 className="text-xl font-bold text-white">{t.title}</h2>
              <button
                onClick={onClose}
                className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors`}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={onMemberLogin}
                className="w-full group p-5 rounded-xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50 hover:bg-emerald-100 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {t.memberTitle}
                    </h3>
                    <p className="text-sm text-gray-600">{t.memberDesc}</p>
                  </div>
                </div>
              </button>

              <button
                onClick={onContinueAsGuest}
                className="w-full group p-5 rounded-xl border-2 border-gray-200 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-all text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-500 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {t.guestTitle}
                    </h3>
                    <p className="text-sm text-gray-600">{t.guestDesc}</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
