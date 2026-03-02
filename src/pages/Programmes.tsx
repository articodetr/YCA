import { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { useContent } from '../contexts/ContentContext';
import { supabase } from '../lib/supabase';
import { CORE_PROGRAMMES, isCoreProgrammeSlug } from '../lib/coreProgrammes';

interface Programme {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  image_url?: string | null;
  gallery_images?: string[] | null;
  slug?: string | null;
  category?: string | null;
  is_active: boolean;
  order_number: number;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
}

const FALLBACK_IMAGES_BY_SLUG: Record<string, string> = {
  women: 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'women-children': 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=1920',
  elderly: 'https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=1920',
  youth: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1920',
  children: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1920',
  education: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=1920',
  men: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'activities-sports': 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1920',
  'journey-within': 'https://images.pexels.com/photos/3810792/pexels-photo-3810792.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function Programmes() {
  const { language, t } = useLanguage();
  const { getContent } = useContent();
  const isRTL = language === 'ar';
  const c = (key: string, fallback: string) => getContent('programmes', key, fallback);

  const [searchParams, setSearchParams] = useSearchParams();

  const initialTab = (searchParams.get('tab') || '').trim();
  const [activeSlug, setActiveSlug] = useState<string>(
    isCoreProgrammeSlug(initialTab) ? initialTab : CORE_PROGRAMMES[0].slug
  );

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loadingProgrammes, setLoadingProgrammes] = useState(true);
  const [activeNews, setActiveNews] = useState<Article[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    const tab = (searchParams.get('tab') || '').trim();
    if (tab && isCoreProgrammeSlug(tab) && tab !== activeSlug) {
      setActiveSlug(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const programmeBySlug = useMemo(() => {
    const map = new Map<string, Programme>();
    programmes.forEach((p) => {
      const slug = (p.slug || '').trim();
      if (slug) map.set(slug, p);
    });
    return map;
  }, [programmes]);

  const activeProgramme = programmeBySlug.get(activeSlug) || null;

  useEffect(() => {
    void fetchProgrammeNews(activeProgramme?.id || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProgramme?.id]);

  const fetchProgrammes = async () => {
    try {
      setLoadingProgrammes(true);
      const { data, error } = await supabase
        .from('programmes_items')
        .select('*')
        .eq('is_active', true)
        .order('order_number', { ascending: true });
      if (error) throw error;
      setProgrammes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching programmes:', err);
      setProgrammes([]);
    } finally {
      setLoadingProgrammes(false);
    }
  };

  const fetchProgrammeNews = async (programmeId: string | null) => {
    if (!programmeId) {
      setActiveNews([]);
      return;
    }

    try {
      setLoadingNews(true);
      const { data, error } = await supabase
        .from('news')
        .select('id,title,excerpt,category,author,published_at,image_url')
        .eq('programme_id', programmeId)
        .order('published_at', { ascending: false })
        .limit(6);

      if (error) {
        // If the column doesn't exist (older DB), don't break the page.
        console.warn('Programme news query failed:', error);
        setActiveNews([]);
        return;
      }

      setActiveNews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching programme news:', err);
      setActiveNews([]);
    } finally {
      setLoadingNews(false);
    }
  };

  const onTabClick = (slug: string) => {
    setActiveSlug(slug);
    setSearchParams({ tab: slug }, { replace: true });
  };

  const getProgrammeTitle = (slug: string) => {
    const p = programmeBySlug.get(slug);
    if (p) return isRTL && p.title_ar ? p.title_ar : p.title;
    const fallback = CORE_PROGRAMMES.find((x) => x.slug === slug);
    return isRTL ? fallback?.title_ar || slug : fallback?.title_en || slug;
  };

  const getProgrammeDescription = (p: Programme) => (isRTL && p.description_ar ? p.description_ar : p.description);
  const getProgrammeContent = (p: Programme) => (isRTL && p.content_ar ? p.content_ar : (p.content || ''));
  const getProgrammeHero = (p: Programme | null) => {
    if (!p) return FALLBACK_IMAGES_BY_SLUG[activeSlug];
    return p.image_url || FALLBACK_IMAGES_BY_SLUG[p.slug || activeSlug] || FALLBACK_IMAGES_BY_SLUG[CORE_PROGRAMMES[0].slug];
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={c('page_title', t('nav.programmes'))}
        description={c('page_description', '')}
        breadcrumbs={[{ label: c('page_title', t('nav.programmes')) }]}
        pageKey="programmes"
      />

      <div className="pt-20">
        {/* Intro (fully editable from Page Content -> Programmes) */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                className="bg-sand p-10 rounded-lg"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                  {c('intro_title', isRTL ? 'برامجنا' : 'Our Programmes')}
                </h2>
                <p className="text-lg text-muted leading-relaxed mb-4">
                  {c(
                    'intro_p1',
                    isRTL
                      ? 'نقدم مجموعة من البرامج المجتمعية التي تدعم مختلف الفئات العمرية وتساعد على بناء مجتمع قوي ومترابط.'
                      : 'We run a range of community programmes that support different age groups and help build a strong, connected community.'
                  )}
                </p>
                <p className="text-lg text-muted leading-relaxed">
                  {c(
                    'intro_p2',
                    isRTL
                      ? 'اختر برنامجًا من التبويبات أدناه لتعرف المزيد عن أهدافه وأنشطته وأحدث أخباره.'
                      : 'Select a programme from the tabs below to learn more about its aims, activities, and latest news.'
                  )}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Programmes (single page, no navigation) */}
        <section className="py-20 bg-sand">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-10"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">
                  {c('programmes_title', isRTL ? 'استكشف برامجنا' : 'Explore Our Programmes')}
                </h2>
                <motion.div
                  className="w-24 h-1 bg-accent mx-auto mb-6"
                  variants={scaleIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
                <p className="text-lg text-muted max-w-3xl mx-auto">
                  {c(
                    'programmes_intro',
                    isRTL
                      ? 'كل برنامج مصمم لدعم المجتمع عبر أنشطة وخدمات مناسبة. يمكن تعديل محتوى الصفحة من لوحة الأدمن (Page Content → Programmes).'
                      : 'Each programme is designed to support the community through relevant activities and services. You can edit this page from Admin (Page Content → Programmes).'
                  )}
                </p>
              </motion.div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-white">
                  <div className="flex flex-wrap gap-2 p-4 justify-center">
                    {CORE_PROGRAMMES.map((tab) => {
                      const isActive = tab.slug === activeSlug;
                      return (
                        <button
                          key={tab.slug}
                          onClick={() => onTabClick(tab.slug)}
                          className={`px-5 py-2.5 rounded-xl font-semibold transition-all border-2 ${
                            isActive
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-primary border-transparent hover:border-primary/30'
                          }`}
                        >
                          {getProgrammeTitle(tab.slug)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab body */}
                <div className="p-6 md:p-10">
                  {loadingProgrammes ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={44} className="text-primary animate-spin" />
                    </div>
                  ) : (
                    <motion.div
                      variants={fadeInUp}
                      initial="hidden"
                      animate="visible"
                      key={activeSlug}
                      className="space-y-10"
                    >
                      {/* Hero */}
                      <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="relative overflow-hidden rounded-2xl border border-gray-100">
                          <img
                            src={getProgrammeHero(activeProgramme)}
                            alt={getProgrammeTitle(activeSlug)}
                            className="w-full h-72 md:h-96 object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-primary mb-4">
                            {getProgrammeTitle(activeSlug)}
                          </h3>

                          {activeProgramme ? (
                            <>
                              <p className="text-lg text-muted leading-relaxed mb-5">
                                {getProgrammeDescription(activeProgramme)}
                              </p>

                              {getProgrammeContent(activeProgramme) ? (
                                <div className="space-y-4">
                                  {splitParagraphs(getProgrammeContent(activeProgramme)).map((p, idx) => (
                                    <p key={idx} className="text-muted leading-relaxed">
                                      {p}
                                    </p>
                                  ))}
                                </div>
                              ) : null}
                            </>
                          ) : (
                            <p className="text-lg text-muted leading-relaxed">
                              {isRTL
                                ? 'سيتم إضافة تفاصيل هذا البرنامج قريبًا.'
                                : 'Programme details will be available soon.'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Gallery */}
                      {activeProgramme && Array.isArray(activeProgramme.gallery_images) && activeProgramme.gallery_images.length > 0 ? (
                        <div>
                          <h4 className="text-2xl font-bold text-primary mb-4">
                            {c('gallery_title', isRTL ? 'صور البرنامج' : 'Programme Photos')}
                          </h4>
                          <motion.div
                            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                          >
                            {activeProgramme.gallery_images.map((url, idx) => (
                              <motion.div key={idx} variants={staggerItem} className="overflow-hidden rounded-xl border border-gray-100">
                                <img src={url} alt="" className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>
                      ) : null}

                      {/* Programme news */}
                      <div>
                        <h4 className="text-2xl font-bold text-primary mb-4">
                          {c('news_title', isRTL ? 'أخبار البرنامج' : 'Programme News')}
                        </h4>

                        {loadingNews ? (
                          <div className="flex items-center justify-center py-10">
                            <Loader2 size={32} className="text-primary animate-spin" />
                          </div>
                        ) : activeNews.length === 0 ? (
                          <div className="bg-sand/50 border border-gray-100 rounded-xl p-6">
                            <p className="text-muted">
                              {c('news_empty', isRTL ? 'لا توجد أخبار مرتبطة بهذا البرنامج حاليًا.' : 'There are no news items linked to this programme yet.')}
                            </p>
                          </div>
                        ) : (
                          <motion.div
                            className="grid md:grid-cols-2 gap-6"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                          >
                            {activeNews.map((a) => (
                              <motion.article
                                key={a.id}
                                variants={staggerItem}
                                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                              >
                                <div className="relative overflow-hidden">
                                  <img
                                    src={a.image_url || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'}
                                    alt={a.title}
                                    className="w-full h-44 object-cover"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="p-5">
                                  <div className="flex items-center gap-3 text-sm text-muted mb-2">
                                    <span className="inline-flex items-center gap-2">
                                      <Calendar size={16} />
                                      {new Date(a.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                  </div>
                                  <h5 className="text-lg font-bold text-primary mb-2 line-clamp-2">{a.title}</h5>
                                  <p className="text-muted leading-relaxed line-clamp-3 mb-4">{a.excerpt}</p>
                                  <Link
                                    to={`/news/${a.id}`}
                                    className="text-primary font-semibold hover:text-accent transition-colors"
                                  >
                                    {isRTL ? 'اقرأ المزيد' : 'Read More'}
                                  </Link>
                                </div>
                              </motion.article>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA (editable from Page Content -> Programmes) */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-5xl mx-auto bg-primary text-white p-10 rounded-2xl"
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">
                {c('cta_title', isRTL ? 'انضم إلى برامجنا' : 'Join Our Programmes')}
              </h2>
              <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                {c(
                  'cta_desc',
                  isRTL
                    ? 'سواء كنت تبحث عن المشاركة أو التطوع أو دعم مبادراتنا، فهناك مكان لك في برامج مجتمعنا.'
                    : "Whether you're looking to participate, volunteer, or support our initiatives, there's a place for you in our community programmes."
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/membership"
                  className="bg-accent text-primary px-8 py-3 rounded-lg hover:bg-hover transition-colors font-semibold text-center"
                >
                  {c('cta_btn_member', isRTL ? 'كن عضواً' : 'Become a Member')}
                </Link>
                <Link
                  to="/contact"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold text-center"
                >
                  {c('cta_btn_contact', t('button.contactUs'))}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
