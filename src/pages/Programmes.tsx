import { useState, useEffect } from 'react';
import { Users, Heart, Sparkles, Baby, Briefcase, Compass, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface Programme {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  image_url?: string;
  category: string;
  slug?: string;
  link?: string;
  color: string;
  icon: string;
  is_active: boolean;
  order_number: number;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Users,
  Heart,
  Sparkles,
  Baby,
  Briefcase,
  Compass,
};

const CATEGORY_COLORS: Record<string, string> = {
  journey: 'from-teal-500 to-emerald-600',
  women: 'from-rose-500 to-pink-500',
  elderly: 'from-amber-500 to-orange-500',
  youth: 'from-blue-500 to-cyan-500',
  children: 'from-green-500 to-emerald-500',
  men: 'from-slate-600 to-slate-700',
};

const FALLBACK_IMAGES: Record<string, string> = {
  journey: 'https://images.pexels.com/photos/3810792/pexels-photo-3810792.jpeg?auto=compress&cs=tinysrgb&w=800',
  women: 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=800',
  elderly: 'https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=800',
  youth: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=800',
  children: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
  men: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  journey: 'Journey',
  women: "Women's",
  elderly: "Elderly's",
  youth: 'Youth',
  children: "Children's",
  men: "Men's",
};

const CATEGORY_LABELS_AR: Record<string, string> = {
  journey: 'الرحلة',
  women: 'النساء',
  elderly: 'كبار السن',
  youth: 'الشباب',
  children: 'الأطفال',
  men: 'الرجال',
};

export default function Programmes() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programmes_items')
        .select('*')
        .eq('is_active', true)
        .order('order_number', { ascending: true });

      if (error) throw error;
      setProgrammes(data || []);
    } catch (err) {
      console.error('Error fetching programmes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgrammeTitle = (p: Programme) =>
    isRTL && p.title_ar ? p.title_ar : p.title;

  const getProgrammeDescription = (p: Programme) =>
    isRTL && p.description_ar ? p.description_ar : p.description;

  const getProgrammeLink = (p: Programme) => {
    if (p.slug) return `/programmes/${p.slug}`;
    if (p.link) return p.link;
    return `/programmes/${p.category}`;
  };

  const getProgrammeImage = (p: Programme) =>
    p.image_url || FALLBACK_IMAGES[p.category] || FALLBACK_IMAGES['youth'];

  const getIconComponent = (iconName: string) =>
    ICON_MAP[iconName] || Users;

  const getGradient = (p: Programme) =>
    CATEGORY_COLORS[p.category] || 'from-gray-500 to-gray-700';

  const uniqueCategories = Array.from(new Set(programmes.map(p => p.category)));

  const getCategoryLabel = (cat: string) =>
    isRTL ? (CATEGORY_LABELS_AR[cat] || cat) : (CATEGORY_LABELS_EN[cat] || cat);

  const allLabel = isRTL ? 'الكل' : 'All';

  const internalSelectedCat = selectedCategory === allLabel || selectedCategory === 'All'
    ? 'All'
    : Object.keys(CATEGORY_LABELS_EN).find(
        k => CATEGORY_LABELS_EN[k] === selectedCategory || CATEGORY_LABELS_AR[k] === selectedCategory
      ) || selectedCategory;

  const filteredProgrammes = internalSelectedCat === 'All'
    ? programmes
    : programmes.filter(p => p.category === internalSelectedCat);

  const tabColors = [
    { bg: 'bg-emerald-500', border: 'border-emerald-500' },
    { bg: 'bg-teal-500', border: 'border-teal-500' },
    { bg: 'bg-rose-500', border: 'border-rose-500' },
    { bg: 'bg-amber-500', border: 'border-amber-500' },
    { bg: 'bg-blue-500', border: 'border-blue-500' },
    { bg: 'bg-green-500', border: 'border-green-500' },
    { bg: 'bg-slate-600', border: 'border-slate-600' },
  ];

  const displayCategories = [allLabel, ...uniqueCategories.map(c => getCategoryLabel(c))];

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('nav.programmes')}
        description=""
        breadcrumbs={[{ label: t('nav.programmes') }]}
        pageKey="programmes"
      />

      <div className="pt-20">
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={48} className="text-primary animate-spin" />
              </div>
            ) : (
              <>
                <motion.div
                  className="mb-12"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex flex-wrap gap-3 justify-center">
                    {displayCategories.map((category, index) => {
                      const color = tabColors[index % tabColors.length];
                      const isSelected = category === selectedCategory || (
                        (category === allLabel || category === 'All') && (selectedCategory === 'All' || selectedCategory === allLabel)
                      );
                      const count = category === allLabel || category === 'All'
                        ? programmes.length
                        : programmes.filter(p => getCategoryLabel(p.category) === category).length;

                      return (
                        <motion.button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-md ${
                            isSelected
                              ? `${color.bg} text-white border-2 ${color.border}`
                              : `bg-white text-primary border-2 border-transparent hover:${color.border}`
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {category}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                          }`}>
                            {count}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {filteredProgrammes.length === 0 ? (
                  <div className="text-center py-24">
                    <p className="text-xl text-muted">
                      {isRTL ? 'لا توجد برامج متاحة حالياً' : 'No programmes available at the moment.'}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredProgrammes.map((programme) => {
                      const IconComponent = getIconComponent(programme.icon);
                      const gradient = getGradient(programme);
                      const img = getProgrammeImage(programme);
                      const link = getProgrammeLink(programme);

                      return (
                        <motion.div
                          key={programme.id}
                          className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group border-2 border-transparent hover:border-primary"
                          variants={staggerItem}
                          whileHover={{ y: -8 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="relative overflow-hidden">
                            <img
                              src={img}
                              alt={getProgrammeTitle(programme)}
                              className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-700 ease-in-out`}></div>
                            <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                              <div className="bg-white p-3 rounded-lg shadow-lg">
                                <IconComponent className="text-primary" size={24} />
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                              {getProgrammeTitle(programme)}
                            </h3>
                            <p className="text-muted mb-6 leading-relaxed line-clamp-3">
                              {getProgrammeDescription(programme)}
                            </p>
                            <Link
                              to={link}
                              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
                            >
                              {t('home.learnMore')} <Arrow size={18} />
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="py-16 bg-sand">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-lg text-center"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-primary mb-4">
                {isRTL ? 'انضم إلى برامجنا' : 'Join Our Programmes'}
              </h2>
              <p className="text-lg text-muted mb-6">
                {isRTL
                  ? 'سواء كنت تبحث عن المشاركة أو التطوع أو دعم مبادراتنا، فهناك مكان لك في برامج مجتمعنا.'
                  : "Whether you're looking to participate, volunteer, or support our initiatives, there's a place for you in our community programmes."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/membership"
                    className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold inline-block"
                  >
                    {isRTL ? 'كن عضواً' : 'Become a Member'}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="bg-transparent border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold inline-block"
                  >
                    {t('button.contactUs')}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-primary text-white">
          <motion.div
            className="container mx-auto px-4 text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              {isRTL ? 'أحدث فرقاً' : 'Make a Difference'}
            </h2>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              {isRTL
                ? 'دعمك يساعدنا على الاستمرار في تقديم الخدمات الحيوية لأعضاء مجتمعنا'
                : 'Your support helps us continue providing vital services to our community members'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/get-involved/donate"
                  className="bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold inline-block"
                >
                  {isRTL ? 'ادعم عملنا' : 'Support Our Work'}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/get-involved/volunteer"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold inline-block"
                >
                  {isRTL ? 'تطوع معنا' : 'Volunteer With Us'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
