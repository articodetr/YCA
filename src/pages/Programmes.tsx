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
    },
    {
      id: 2,
      title: c('elderly_title', "Elderly's Programme"),
      description: c('elderly_desc', "Supporting our elders with dignity and respect. We provide social activities, health services, and companionship to ensure our senior community members thrive."),
      category: "Elderly's",
      icon: Users,
      link: '/programmes/elderly',
      image: 'https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: 3,
      title: c('youth_title', 'Youth Programme'),
      description: c('youth_desc', "Building tomorrow's leaders today. Our youth programme offers mentorship, sports activities, educational support, and leadership development opportunities."),
      category: 'Youth',
      icon: Sparkles,
      link: '/programmes/youth',
      image: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: 4,
      title: c('children_title', "Children's Programme"),
      description: c('children_desc', "Nurturing young minds through play, learning, and cultural activities. We provide a safe, engaging environment where children can develop and explore."),
      category: "Children's",
      icon: Baby,
      link: '/programmes/children',
      image: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: 5,
      title: c('men_title', "Men's Programme"),
      description: c('men_desc', "Strengthening our community through brotherhood and support. We offer workshops, sports activities, and forums for men to connect and address important issues."),
      category: "Men's",
      icon: Briefcase,
      link: '/programmes/men',
      image: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=800',
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

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={internalCat === 'All' ? t('nav.programmes') : `${selectedCategory}`}
        breadcrumbs={[{ label: t('nav.programmes') }]}
        pageKey="programmes"
      />

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="mb-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, index) => {
                const count = getCategoryCount(category);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedCategory === category
                        ? 'bg-[#0d9488] text-white'
                        : 'bg-gray-100 text-[#64748b] hover:bg-gray-200'
                    }`}
                  >
                    {category}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category
                        ? 'bg-white/20'
                        : 'bg-gray-200'
                    }`}>
                      {count}
                    </span>
                  </button>
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
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
                  variants={staggerItem}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={programme.image}
                      alt={programme.title}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <div className="bg-white p-2.5 rounded-lg shadow-sm">
                        <IconComponent className="text-[#0d9488]" size={22} />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#0f1c2e] mb-3">
                      {programme.title}
                    </h3>
                    <p className="text-[#64748b] mb-6 leading-relaxed text-sm">
                      {programme.description}
                    </p>
                    <Link
                      to={programme.link}
                      className="inline-flex items-center gap-2 text-[#0d9488] font-medium text-sm hover:opacity-80 transition-opacity"
                    >
                      {t('home.learnMore')} <Arrow size={16} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#0f1c2e] mb-4">
              {c('join_title', 'Join Our Programmes')}
            </h2>
            <p className="text-lg text-[#64748b] mb-8 leading-relaxed">
              {c('join_desc', "Whether you're looking to participate, volunteer, or support our initiatives, there's a place for you in our community programmes.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/membership"
                className="bg-[#0d9488] text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium inline-block"
              >
                {isRTL ? 'كن عضواً' : 'Become a Member'}
              </Link>
              <Link
                to="/contact"
                className="border border-[#0f1c2e] text-[#0f1c2e] px-8 py-3 rounded-lg hover:bg-[#0f1c2e] hover:text-white transition-colors font-medium inline-block"
              >
                {t('button.contactUs')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
