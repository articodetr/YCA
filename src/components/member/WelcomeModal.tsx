import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, ArrowRight, Calendar, FileText, Shield,
  Headphones, BookOpen, Heart,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMemberAuth } from '../../contexts/MemberAuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const steps = {
  en: [
    {
      icon: Headphones,
      title: 'Advisory Services',
      desc: 'Get free bilingual advice on welfare, housing, immigration, and more.',
      link: '/services',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: FileText,
      title: 'Wakala (Power of Attorney)',
      desc: 'Apply for official wakala documents with our streamlined process.',
      link: '/book',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Shield,
      title: 'Membership Benefits',
      desc: 'Join as a member for reduced fees and priority appointments.',
      link: '/get-involved/membership',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Calendar,
      title: 'Events & Programmes',
      desc: 'Participate in community events, workshops, and cultural activities.',
      link: '/events',
      color: 'bg-sky-50 text-sky-600',
    },
    {
      icon: BookOpen,
      title: 'Community Programmes',
      desc: 'Explore programmes for women, youth, children, and elderly.',
      link: '/programmes',
      color: 'bg-teal-50 text-teal-600',
    },
    {
      icon: Heart,
      title: 'Support Us',
      desc: 'Donate or volunteer to help strengthen our community.',
      link: '/get-involved/donate',
      color: 'bg-rose-50 text-rose-600',
    },
  ],
  ar: [
    {
      icon: Headphones,
      title: 'خدمات استشارية',
      desc: 'احصل على مشورة مجانية ثنائية اللغة حول الرعاية الاجتماعية والإسكان والهجرة وأكثر.',
      link: '/services',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: FileText,
      title: 'الوكالة (التوكيل الشرعي)',
      desc: 'قدم طلب وكالة رسمية من خلال عمليتنا المبسطة.',
      link: '/book',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: Shield,
      title: 'مزايا العضوية',
      desc: 'انضم كعضو للحصول على رسوم مخفضة ومواعيد ذات أولوية.',
      link: '/get-involved/membership',
      color: 'bg-amber-50 text-amber-600',
    },
    {
      icon: Calendar,
      title: 'الفعاليات والبرامج',
      desc: 'شارك في الفعاليات المجتمعية وورش العمل والأنشطة الثقافية.',
      link: '/events',
      color: 'bg-sky-50 text-sky-600',
    },
    {
      icon: BookOpen,
      title: 'البرامج المجتمعية',
      desc: 'استكشف برامج النساء والشباب والأطفال وكبار السن.',
      link: '/programmes',
      color: 'bg-teal-50 text-teal-600',
    },
    {
      icon: Heart,
      title: 'ادعمنا',
      desc: 'تبرع أو تطوع للمساعدة في تعزيز مجتمعنا.',
      link: '/get-involved/donate',
      color: 'bg-rose-50 text-rose-600',
    },
  ],
};

export default function WelcomeModal({ isOpen, onClose }: Props) {
  const { language } = useLanguage();
  const { user } = useMemberAuth();
  const isRTL = language === 'ar';
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    setClosing(true);
    if (user) {
      await supabase
        .from('member_profiles')
        .upsert({ id: user.id, onboarding_completed: true, updated_at: new Date().toISOString() });
    }
    onClose();
  };

  const currentSteps = steps[language];
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 end-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="bg-gradient-to-br from-[#1b2b45] to-[#2a3f5f] p-8 rounded-t-2xl text-white">
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'ar'
                    ? `مرحبا بك${userName ? ` ${userName}` : ''}!`
                    : `Welcome${userName ? `, ${userName}` : ''}!`}
                </h2>
                <p className="text-white/80 text-sm">
                  {language === 'ar'
                    ? 'نحن سعداء بانضمامك إلينا. إليك نظرة سريعة على ما نقدمه.'
                    : "We're glad to have you. Here's a quick look at what we offer."}
                </p>
              </motion.div>
            </div>

            <div className="p-6 space-y-3">
              {currentSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ x: isRTL ? 20 : -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + idx * 0.08 }}
                  >
                    <Link
                      to={step.link}
                      onClick={handleClose}
                      className="flex items-center gap-4 p-4 rounded-xl border border-divider hover:border-primary/30 hover:shadow-sm transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary">{step.title}</p>
                        <p className="text-xs text-muted mt-0.5">{step.desc}</p>
                      </div>
                      <ArrowRight className={`w-4 h-4 text-muted group-hover:text-primary transition-colors flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={handleClose}
                disabled={closing}
                className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 rounded-xl transition-colors"
              >
                {language === 'ar' ? 'ابدأ الآن' : "Let's Get Started"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
