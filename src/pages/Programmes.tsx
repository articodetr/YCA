import { useState } from 'react';
import { Users, Heart, Sparkles, Baby, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Programmes() {
  const { getContent } = useContent();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const c = (key: string, fallback: string) => getContent('programmes', key, fallback);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [selectedCategory, setSelectedCategory] = useState('All');

  const programmes = [
    {
      id: 1,
      title: c('women_title', "Women's Programme"),
      description: c('women_desc', "Empowering women through education, skills training, and community support. We offer workshops, health awareness sessions, and a safe space for women to connect and grow."),
      category: "Women's",
      icon: Heart,
      link: '/programmes/women',
      image: 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-rose-500 to-pink-500',
    },
    {
      id: 2,
      title: c('elderly_title', "Elderly's Programme"),
      description: c('elderly_desc', "Supporting our elders with dignity and respect. We provide social activities, health services, and companionship to ensure our senior community members thrive."),
      category: "Elderly's",
      icon: Users,
      link: '/programmes/elderly',
      image: 'https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 3,
      title: c('youth_title', 'Youth Programme'),
      description: c('youth_desc', "Building tomorrow's leaders today. Our youth programme offers mentorship, sports activities, educational support, and leadership development opportunities."),
      category: 'Youth',
      icon: Sparkles,
      link: '/programmes/youth',
      image: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 4,
      title: c('children_title', "Children's Programme"),
      description: c('children_desc', "Nurturing young minds through play, learning, and cultural activities. We provide a safe, engaging environment where children can develop and explore."),
      category: "Children's",
      icon: Baby,
      link: '/programmes/children',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 5,
      title: c('men_title', "Men's Programme"),
      description: c('men_desc', "Strengthening our community through brotherhood and support. We offer workshops, sports activities, and forums for men to connect and address important issues."),
      category: "Men's",
      icon: Briefcase,
      link: '/programmes/men',
      image: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
      color: 'from-slate-600 to-slate-700',
    },
  ];

  const categoriesEn = ['All', "Women's", "Elderly's", 'Youth', "Children's", "Men's"];
  const categoriesAr = ['الكل', 'النساء', 'كبار السن', 'الشباب', 'الأطفال', 'الرجال'];
  const categories = isRTL ? categoriesAr : categoriesEn;
  const categoryMap: Record<string, string> = isRTL
    ? { 'الكل': 'All', 'النساء': "Women's", 'كبار السن': "Elderly's", 'الشباب': 'Youth', 'الأطفال': "Children's", 'الرجال': "Men's" }
    : {};
  const getInternalCat = (cat: string) => categoryMap[cat] || cat;

  const internalCat = getInternalCat(selectedCategory);
  const filteredProgrammes = internalCat === 'All'
    ? programmes
    : programmes.filter(programme => programme.category === internalCat);

  const getCategoryCount = (category: string) => {
    const ic = getInternalCat(category);
    if (ic === 'All') return programmes.length;
    return programmes.filter(programme => programme.category === ic).length;
  };

  const getHeaderImage = () => {
    switch (internalCat) {
      case "Women's":
        return 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=1920';
      case "Elderly's":
        return 'https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=1920';
      case 'Youth':
        return 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1920';
      case "Children's":
        return 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1920';
      case "Men's":
        return 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=1920';
      default:
        return 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1920';
    }
  };

  const getHeaderDescription = () => {
    return '';
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={internalCat === 'All' ? t('nav.programmes') : `${selectedCategory}`}
        description={getHeaderDescription()}
        breadcrumbs={[{ label: t('nav.programmes') }]}
        pageKey="programmes"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, index) => {
                const count = getCategoryCount(category);
                return (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-sand text-primary hover:bg-accent'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category
                        ? 'bg-white bg-opacity-20'
                        : 'bg-primary bg-opacity-10'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {filteredProgrammes.map((programme) => {
              const IconComponent = programme.icon;
              return (
                <motion.div
                  key={programme.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={programme.image}
                      alt={programme.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${programme.color} opacity-20 group-hover:opacity-30 transition-opacity duration-700 ease-in-out`}></div>
                    <div className="absolute top-4 left-4">
                      <div className="bg-white p-3 rounded-lg shadow-lg">
                        <IconComponent className="text-primary" size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                      {programme.title}
                    </h3>
                    <p className="text-muted mb-6 leading-relaxed">
                      {programme.description}
                    </p>
                    <Link
                      to={programme.link}
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
                    >
                      {t('home.learnMore')} <Arrow size={18} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
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
            <h2 className="text-3xl font-bold text-primary mb-4">{c('join_title', 'Join Our Programmes')}</h2>
            <p className="text-lg text-muted mb-6">
              {c('join_desc', "Whether you're looking to participate, volunteer, or support our initiatives, there's a place for you in our community programmes.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/get-involved/membership"
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
          <h2 className="text-3xl font-bold mb-4">{c('cta_title', 'Make a Difference')}</h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            {c('cta_desc', 'Your support helps us continue providing vital services to our community members')}
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
