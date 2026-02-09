import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeInUp } from '../lib/animations';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  image?: string;
  pageKey?: string;
}

export default function PageHeader({ title, description, breadcrumbs, image, pageKey }: PageHeaderProps) {
  const { getPageImage } = useSiteSettings();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const bgImage = image || (pageKey ? getPageImage(pageKey, 'header_bg', '') : '');

  return (
    <section className="relative bg-primary overflow-hidden min-h-[220px] md:min-h-[260px] flex items-end">
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/75" />
        </div>
      )}
      {!bgImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary" />
      )}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10 pb-10 pt-28" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <Link to="/" className="hover:text-accent transition-colors">{isRTL ? 'الرئيسية' : 'Home'}</Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-gray-500">/</span>
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-accent transition-colors">{crumb.label}</Link>
                  ) : (
                    <span className="text-white">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">{title}</h1>
          {description && (
            <p className="mt-3 text-base md:text-lg text-gray-300 max-w-2xl leading-relaxed">{description}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}
