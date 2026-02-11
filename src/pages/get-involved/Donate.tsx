import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { useLanguage } from '../../contexts/LanguageContext';
import Layout from '../../components/Layout';
import PageHeader from '../../components/PageHeader';
import DonationForm from '../../components/DonationForm';
import { AlertCircle } from 'lucide-react';

export default function Donate() {
  const { language, isRTL } = useLanguage();
  const isAr = language === 'ar';

  const txt = {
    title: isAr ? 'تبرع' : 'Donate',
    breadcrumbHome: isAr ? 'الرئيسية' : 'Home',
    breadcrumbGetInvolved: isAr ? 'شارك معنا' : 'Get Involved',
    breadcrumbDonate: isAr ? 'تبرع' : 'Donate',
    stripeError: isAr ? 'نظام الدفع غير متوفر حالياً. يرجى المحاولة لاحقاً.' : 'Payment system is currently unavailable. Please try again later.',
  };

  return (
    <Layout>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <PageHeader
            title={txt.title}
            breadcrumbs={[
              { label: txt.breadcrumbHome, path: '/' },
              { label: txt.breadcrumbGetInvolved },
              { label: txt.breadcrumbDonate },
            ]}
            pageKey="donate"
          />
          <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <DonationForm />
                </Elements>
              ) : (
                <div className="max-w-2xl mx-auto text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{txt.stripeError}</p>
                </div>
              )}
            </div>
          </section>
      </div>
    </Layout>
  );
}
