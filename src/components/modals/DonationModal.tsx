import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import DonationForm from '../DonationForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const t = {
    en: {
      title: 'Make a Donation',
      subtitle: 'Support our community programmes',
    },
    ar: {
      title: 'تبرع الآن',
      subtitle: 'ادعم برامج مجتمعنا',
    },
  };

  const text = t[language];

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
          <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 rounded-t-2xl z-10">
            <button
              onClick={onClose}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white hover:bg-white/20 rounded-full p-2 transition-colors`}
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2">{text.title}</h2>
            <p className="text-amber-100 text-sm">{text.subtitle}</p>
          </div>

          <div className="p-6">
            <DonationForm onSuccess={onClose} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
