import { MessageCircle, Phone } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HelpCard() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const t = {
    en: {
      title: 'We can help you',
      callUs: 'Call us at',
      or: 'or',
      chatText: 'chat with our customer support team to clear all your doubts.',
      chatButton: 'Chat with us',
    },
    ar: {
      title: 'نحن هنا لمساعدتك',
      callUs: 'اتصل بنا على',
      or: 'أو',
      chatText: 'تحدث مع فريق دعم العملاء لدينا للإجابة على جميع استفساراتك.',
      chatButton: 'تحدث معنا',
    },
  }[language];

  const handleCall = () => {
    window.location.href = 'tel:+46700000000';
  };

  const handleChat = () => {
    console.log('Opening chat...');
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <MessageCircle className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">{t.title}</h3>
      </div>

      <p className="text-gray-600 text-sm mb-4">
        {t.callUs}{' '}
        <button
          onClick={handleCall}
          className="font-bold text-gray-900 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
        >
          <Phone className="w-3 h-3" />
          +46 70 000 0000
        </button>{' '}
        {t.or} {t.chatText}
      </p>

      <button
        onClick={handleChat}
        className="w-full py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
      >
        {t.chatButton}
      </button>
    </div>
  );
}
