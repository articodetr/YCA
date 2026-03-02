import { useMemo, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, FileText, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { CORE_PROGRAMME_SLUGS, CORE_PROGRAMME_TABS } from '../lib/coreProgrammes';

type Programme = {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  image_url?: string;
  slug?: string;
  category: string;
  is_active: boolean;
  order_number: number;
};

type ProgrammeNewsItem = {
  id: string;
  title: string;
  title_ar?: string;
  excerpt: string;
  description_ar?: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
};

const FALLBACK_IMAGE =
  'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1400';

export default function Programmes() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const [searchParams, setSearchParams] = useSearchParams();

  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSlug, setSelectedSlug] = useState<string>(CORE_PROGRAMME_TABS[0]?.slug || 'women');
  const [newsLoading, setNewsLoading] = useState(false);
  const [programmeNews, setProgrammeNews] = useState<ProgrammeNewsItem[]>([]);

  const programmeBySlug = useMemo(() => {
    const m = new Map<string, Programme>();
    (programmes || []).forEach((p) => {
      if (p.slug) m.set(p.slug, p);
    });
    return m;
  }, [programmes]);

  const selectedProgramme = programmeBySlug.get(selectedSlug);

  const getProgrammeTitle = (p: Programme) => (isRTL && p.title_ar ? p.title_ar : p.title);
  const getProgrammeDescription = (p: Programme) =>
    isRTL && p.description_ar ? p.description_ar : p.description;
  const getProgrammeContent = (p: Programme) => (isRTL && p.content_ar ? p.content_ar : (p.content || ''));
  const getNewsTitle = (n: ProgrammeNewsItem) => (isRTL && n.title_ar ? n.title_ar : n.title);
  const getNewsExcerpt = (n: ProgrammeNewsItem) => (isRTL && n.description_ar ? n.description_ar : n.excerpt);

  const syncSlugToUrl = (slug: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', slug);
      return next;
    });
  };

  useEffect(() => {
    const tab = (searchParams.get('tab') || '').trim();
    if (tab && CORE_PROGRAMME_SLUGS.includes(tab)) {
      setSelectedSlug(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchProgrammes = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('programmes_items')
          .select('*')
          .eq('is_active', true)
          .in('slug', CORE_PROGRAMME_SLUGS)
          .order('order_number', { ascending: true });

        if (error) throw error;
        setProgrammes(data || []);
      } catch (err) {
        console.error('Error fetching programmes:', err);
        setProgrammes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgrammes();
  }, []);

  // If the selected programme is missing (not configured), fall back to the first configured one.
  useEffect(() => {
    if (loading) return;
    if (selectedProgramme) return;

    const first = programmeBySlug.get(CORE_PROGRAMME_TABS[0]?.slug || 'women') || programmes.find((p) => p.slug);
    if (first?.slug) {
      setSelectedSlug(first.slug);
      syncSlugToUrl(first.slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, programmeBySlug]);

  useEffect(() => {
    if (!selectedProgramme?.id) {
      setProgrammeNews([]);
      return;
    }

    const fetchProgrammeNews = async () => {
      try {
        setNewsLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('id,title,title_ar,excerpt,description_ar,category,author,published_at,image_url')
          .eq('programme_id', selectedProgramme.id)
          .order('published_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setProgrammeNews(data || []);
      } catch (err) {
        console.error('Error fetching programme news:', err);
        setProgrammeNews([]);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchProgrammeNews();
  }, [selectedProgramme?.id]);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('nav.programmes')}
        description=""
        breadcrumbs={[{ label: t('nav.programmes') }]}
        pageKey="programmes"
      />

      <div className="pt-20">
        <section className="py-14 bg-white">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 size={48} className="text-primary animate-spin" />
              </div>
            ) : (
              <>
                <motion.div
                  className="mb-10"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="flex flex-wrap gap-3 justify-center">
                    {CORE_PROGRAMME_TABS.map((tab, index) => {
                      const isSelected = tab.slug === selectedSlug;
                      const colors = [
                        { bg: 'bg-emerald-600', border: 'border-emerald-600' },
                        { bg: 'bg-teal-600', border: 'border-teal-600' },
                        { bg: 'bg-rose-600', border: 'border-rose-600' },
                        { bg: 'bg-amber-600', border: 'border-amber-600' },
                        { bg: 'bg-blue-600', border: 'border-blue-600' },
                        { bg: 'bg-green-600', border: 'border-green-600' },
                        { bg: 'bg-slate-700', border: 'border-slate-700' },
                        { bg: 'bg-purple-600', border: 'border-purple-600' },
                        { bg: 'bg-orange-600', border: 'border-orange-600' },
                      ];
                      const color = colors[index % colors.length];
                      const label = isRTL ? tab.title_ar : tab.title;

                      return (
                        <motion.button
                          key={tab.slug}
                          onClick={() => {
                            setSelectedSlug(tab.slug);
                            syncSlugToUrl(tab.slug);
                          }}
                          className={`px-5 py-3 rounded-2xl font-semibold transition-all shadow-md border-2 ${
                            isSelected
                              ? `${color.bg} text-white ${color.border}`
                              : `bg-white text-primary border-transparent hover:${color.border}`
                          }`}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {!selectedProgramme ? (
                  <div className="text-center py-20 max-w-2xl mx-auto">
                    <p className="text-lg text-muted">
                      {isRTL
                        ? 'هذا البرنامج غير مُعد بعد في لوحة الإدارة. يرجى إضافة/تحديث بياناته من Admin > Programmes.'
                        : 'This programme is not configured yet. Please update it from Admin > Programmes.'}
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="max-w-5xl mx-auto"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div
                      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                      variants={staggerItem}
                    >
                      <div className="relative">
                        <img
                          src={selectedProgramme.image_url || FALLBACK_IMAGE}
                          alt={getProgrammeTitle(selectedProgramme)}
                          className="w-full h-72 md:h-[420px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/60" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            {getProgrammeTitle(selectedProgramme)}
                          </h2>
                          <p className="text-white/85 max-w-3xl leading-relaxed">
                            {getProgrammeDescription(selectedProgramme)}
                          </p>
                          <div className="mt-6">
                            <Link
                              to={`/programmes/${selectedProgramme.slug || selectedProgramme.id}`}
                              className="inline-flex items-center gap-2 bg-accent text-primary px-6 py-3 rounded-lg font-semibold hover:bg-hover transition-colors"
                            >
                              {isRTL ? 'عرض صفحة البرنامج' : 'Open Programme Page'} <Arrow size={18} />
                            </Link>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 md:p-10">
                        {getProgrammeContent(selectedProgramme) ? (
                          <div className="text-muted leading-relaxed space-y-5 text-base md:text-lg">
                            {getProgrammeContent(selectedProgramme)
                              .split('\n')
                              .map((p, idx) => (p.trim() ? <p key={idx}>{p}</p> : null))}
                          </div>
                        ) : null}

                        <div className="mt-10 pt-8 border-t border-gray-100">
                          <div className="flex items-center gap-3 mb-6">
                            <FileText className="text-primary" size={22} />
                            <h3 className="text-2xl font-bold text-primary">
                              {isRTL ? 'أخبار البرنامج' : 'Programme News'}
                            </h3>
                          </div>

                          {newsLoading ? (
                            <div className="flex items-center justify-center py-10">
                              <Loader2 size={32} className="text-primary animate-spin" />
                            </div>
                          ) : programmeNews.length === 0 ? (
                            <p className="text-muted">
                              {isRTL ? 'لا توجد أخبار لهذا البرنامج حالياً.' : 'No news for this programme yet.'}
                            </p>
                          ) : (
                            <motion.div
                              className="grid md:grid-cols-2 gap-6"
                              variants={staggerContainer}
                              initial="hidden"
                              animate="visible"
                            >
                              {programmeNews.map((n) => (
                                <motion.article
                                  key={n.id}
                                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all"
                                  variants={staggerItem}
                                  whileHover={{ y: -4 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Link to={`/news/${n.id}`} className="block">
                                    <div className="relative overflow-hidden">
                                      <img
                                        src={n.image_url || FALLBACK_IMAGE}
                                        alt={getNewsTitle(n)}
                                        className="w-full h-44 object-cover"
                                      />
                                    </div>
                                    <div className="p-5">
                                      <div className="flex items-center gap-2 text-sm text-muted mb-2">
                                        <Calendar size={16} />
                                        <span>{new Date(n.published_at).toLocaleDateString()}</span>
                                      </div>
                                      <h4 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                                        {getNewsTitle(n)}
                                      </h4>
                                      <p className="text-muted line-clamp-2">{getNewsExcerpt(n)}</p>
                                    </div>
                                  </Link>
                                </motion.article>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
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
