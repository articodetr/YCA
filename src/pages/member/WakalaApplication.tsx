import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';

export default function WakalaApplication() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const translations = {
    en: {
      redirecting: 'Redirecting to dashboard...',
    },
    ar: {
      redirecting: 'جاري التحويل إلى لوحة التحكم...',
    },
  };

  const t = translations[language];

  useEffect(() => {
    navigate('/member/dashboard?openWakala=true', { replace: true });
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">{t.redirecting}</p>
        </div>
      </div>
    </Layout>
  );
}
