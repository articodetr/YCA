import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Heart,
  Sparkles,
  Baby,
  Briefcase,
  Compass,
  ArrowLeft,
  ArrowRight,
  Share2,
  Facebook,
  Linkedin,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Images,
  Calendar,
  FileText,
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Programme {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  image_url?: string;
  gallery_images?: string[];
  category: string;
  slug?: string;
  color: string;
  icon: string;
  is_active: boolean;
  order_number: number;
}

interface ProgrammeNewsItem {
  id: string;
  title: string;
  title_ar?: string;
  excerpt: string;
  description_ar?: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Users, Heart, Sparkles, Baby, Briefcase, Compass,
};

const FALLBACK_IMAGES: Record<string, string> = {
  journey: 'https://images.pexels.com/photos/3810792/pexels-photo-3810792.jpeg?auto=compress&cs=tinysrgb&w=1920',
  women: 'https://images.pexels.com/photos/3184434/pexels-photo-3184434.jpeg?auto=compress&cs=tinysrgb&w=1920',
  elderly: 'https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=1920',
  youth: 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1920',
  children: 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1920',
  men: 'https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg?auto=compress&cs=tinysrgb&w=1920',
};

const CATEGORY_COLORS: Record<string, string> = {
  journey: '#10B981',
  women: '#F43F5E',
  elderly: '#F59E0B',
  youth: '#3B82F6',
  children: '#22C55E',
  men: '#475569',
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

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default function ProgrammeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [relatedProgrammes, setRelatedProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [programmeNews, setProgrammeNews] = useState<ProgrammeNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const allImages = programme
    ? [
        ...(programme.image_url ? [programme.image_url] : []),
        ...(Array.isArray(programme.gallery_images) ? programme.gallery_images : []),
      ]
    : [];

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  useEffect(() => {
    if (id) fetchProgramme();
  }, [id]);

  useEffect(() => {
    if (!programme?.id) {
      setProgrammeNews([]);
      return;
    }

    const fetchProgrammeNews = async () => {
      try {
        setNewsLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('id,title,title_ar,excerpt,description_ar,category,author,published_at,image_url')
          .eq('programme_id', programme.id)
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
  }, [programme?.id]);

  const fetchProgramme = async () => {
    const key = (id ?? '').trim();

    try {
      setLoading(true);
      setError(null);

      if (!key) {
        setError(isRTL ? 'البرنامج غير موجود' : 'Programme not found');
        return;
      }

      let data: Programme | null = null;

      // 1) Preferred: fetch by ID (matches News behaviour)
      if (isUuid(key)) {
        const { data: byId, error: idError } = await supabase
          .from('programmes_items')
          .select('*')
          .eq('id', key)
          .eq('is_active', true)
          .maybeSingle();

        if (idError) throw idError;
        if (byId) data = byId;
      }

      // 2) Backward compatibility: old links that used slug
      if (!data) {
        const { data: bySlug, error: slugError } = await supabase
          .from('programmes_items')
          .select('*')
          .eq('slug', key)
          .eq('is_active', true)
          .maybeSingle();

        if (slugError) throw slugError;
        if (bySlug) data = bySlug;
      }

      // 3) Backward compatibility: old links that used category
      if (!data) {
        const { data: byCategory, error: catError } = await supabase
          .from('programmes_items')
          .select('*')
          .eq('category', key)
          .eq('is_active', true)
          .order('order_number', { ascending: true })
          .limit(1);

        if (catError) throw catError;
        data = byCategory && byCategory.length > 0 ? byCategory[0] : null;
      }

      if (!data) {
        setError(isRTL ? 'البرنامج غير موجود' : 'Programme not found');
        return;
      }

      setProgramme(data);

      const { data: related } = await supabase
        .from('programmes_items')
        .select('*')
        .eq('is_active', true)
        .neq('id', data.id)
        .order('order_number', { ascending: true })
        .limit(3);

      setRelatedProgrammes(related || []);
    } catch (err) {
      console.error('Error fetching programme:', err);
      setError(
        isRTL
          ? 'فشل تحميل البرنامج. يرجى المحاولة مرة أخرى.'
          : 'Failed to load programme. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = programme?.title || '';
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'x':
        shareUrl = `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  const getTitle = (p: Programme) => (isRTL && p.title_ar ? p.title_ar : p.title);
  const getDescription = (p: Programme) => (isRTL && p.description_ar ? p.description_ar : p.description);
  const getContent = (p: Programme) => (isRTL && p.content_ar ? p.content_ar : (p.content || ''));
  const getImage = (p: Programme) => p.image_url || FALLBACK_IMAGES[p.category] || FALLBACK_IMAGES['youth'];
  const getCategoryLabel = (cat: string) =>
    isRTL ? (CATEGORY_LABELS_AR[cat] || cat) : (CATEGORY_LABELS_EN[cat] || cat);
  const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat] || '#10B981';
  const getIconComponent = (iconName: string) => ICON_MAP[iconName] || Users;

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-sand" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div className="flex flex-col items-center justify-center" variants={fadeInUp} initial="hidden" animate="visible">
          <Loader2 size={64} className="text-primary animate-spin mb-4" />
          <p className="text-xl text-muted">{isRTL ? '...جار تحميل البرنامج' : 'Loading programme...'}</p>
        </motion.div>
      </div>
    );
  }

  if (error || !programme) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-sand" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div className="text-center py-32 max-w-2xl mx-auto px-4" variants={fadeInUp} initial="hidden" animate="visible">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-primary mb-4">
            {isRTL ? 'البرنامج غير موجود' : 'Programme Not Found'}
          </h3>
          <p className="text-lg text-muted mb-8">
            {error || (isRTL ? 'البرنامج الذي تبحث عنه غير موجود.' : 'The programme you are looking for does not exist.')}
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/programmes')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {isRTL ? 'العودة إلى البرامج' : 'Back to Programmes'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const IconComponent = getIconComponent(programme.icon);
  const heroImage = getImage(programme);
  const programmeTitle = getTitle(programme);
  const programmeContent = getContent(programme);
  const programmeDescription = getDescription(programme);
  const catColor = getCategoryColor(programme.category);
  const getNewsTitle = (n: ProgrammeNewsItem) => (isRTL && n.title_ar ? n.title_ar : n.title);
  const getNewsExcerpt = (n: ProgrammeNewsItem) => (isRTL && n.description_ar ? n.description_ar : n.excerpt);
  const fallbackNewsImg = 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1200';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="relative h-[600px] md:h-[700px] overflow-hidden pt-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>

        <div className="relative h-full container mx-auto px-4 flex flex-col justify-between py-12">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <Link
              to="/programmes"
              className="inline-flex items-center gap-2 text-white hover:text-accent transition-colors font-semibold bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {isRTL ? 'العودة إلى البرامج' : 'Back to Programmes'}
            </Link>
          </motion.div>

          <motion.div className="max-w-5xl" variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white p-3 rounded-xl shadow-lg">
                <IconComponent size={28} style={{ color: catColor }} />
              </div>
              <span
                className="inline-block text-white px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wide"
                style={{ backgroundColor: catColor }}
              >
                {getCategoryLabel(programme.category)}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {programmeTitle}
            </h1>

            <p className="text-lg text-white/80 max-w-3xl leading-relaxed">{programmeDescription}</p>
          </motion.div>
        </div>
      </section>

      <article className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className={`relative ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                <motion.button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 size={18} />
                  {isRTL ? 'مشاركة' : 'Share'}
                </motion.button>

                {showShareMenu && (
                  <motion.div
                    className={`absolute top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} bg-white shadow-xl rounded-lg p-4 z-10 border-2 border-gray-100`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => handleShare('facebook')}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        title="Facebook"
                      >
                        <Facebook size={20} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare('x')}
                        className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        title="X"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare('whatsapp')}
                        className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        title="WhatsApp"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare('linkedin')}
                        className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        title="LinkedIn"
                      >
                        <Linkedin size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {programmeContent ? (
              <div className="prose prose-lg max-w-none">
                <div className="text-muted leading-relaxed space-y-6 text-lg">
                  {programmeContent.split('\n').map((paragraph, index) =>
                    paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted leading-relaxed text-lg">
                <p>{programmeDescription}</p>
              </div>
            )}

            {allImages.length > 1 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Images size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-primary">{isRTL ? 'معرض الصور' : 'Photo Gallery'}</h3>
                  <span className="text-sm text-muted bg-sand px-3 py-1 rounded-full">
                    {allImages.length} {isRTL ? 'صور' : 'photos'}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => openLightbox(idx)}
                      className="relative group overflow-hidden rounded-xl aspect-[4/3]"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={img}
                        alt={`${programmeTitle} - ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} className="text-primary" />
                <h3 className="text-2xl font-bold text-primary">{isRTL ? 'أخبار البرنامج' : 'Programme News'}</h3>
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
                  whileInView="visible"
                  viewport={{ once: true }}
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
                            src={n.image_url || fallbackNewsImg}
                            alt={getNewsTitle(n)}
                            className="w-full h-44 object-cover"
                          />
                        </div>
                        <div className="p-5">
                          <div className="flex items-center gap-2 text-sm text-muted mb-2">
                            <Calendar size={16} />
                            <span>{new Date(n.published_at).toLocaleDateString()}</span>
                          </div>
                          <h4 className="text-lg font-bold text-primary mb-2 line-clamp-2">{getNewsTitle(n)}</h4>
                          <p className="text-muted line-clamp-2">{getNewsExcerpt(n)}</p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </article>

      <AnimatePresence>
        {lightboxOpen && allImages.length > 0 && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X size={28} />
            </button>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              {lightboxIndex + 1} / {allImages.length}
            </div>

            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                  className="absolute left-4 md:left-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
                >
                  <ChevronLeft size={36} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                  className="absolute right-4 md:right-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
                >
                  <ChevronRight size={36} />
                </button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              src={allImages[lightboxIndex]}
              alt={`${programmeTitle} - ${lightboxIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            />

            {allImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`w-12 h-9 rounded overflow-hidden border-2 transition-all ${
                      idx === lightboxIndex ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {relatedProgrammes.length > 0 && (
        <section className="py-16 bg-sand">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-primary text-center mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {isRTL ? 'برامج أخرى' : 'Other Programmes'}
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {relatedProgrammes.map((related) => {
                const RelatedIcon = getIconComponent(related.icon);
                const relatedColor = getCategoryColor(related.category);
                return (
                  <motion.div
                    key={related.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                    variants={staggerItem}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getImage(related)}
                        alt={getTitle(related)}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      />
                      <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                        <span
                          className="text-white px-3 py-1 rounded-full text-xs font-bold uppercase"
                          style={{ backgroundColor: relatedColor }}
                        >
                          {getCategoryLabel(related.category)}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-sand p-2 rounded-lg">
                          <RelatedIcon size={20} style={{ color: relatedColor }} />
                        </div>
                        <h3 className="text-xl font-bold text-primary group-hover:text-accent transition-colors line-clamp-2">
                          {getTitle(related)}
                        </h3>
                      </div>
                      <p className="text-muted mb-4 line-clamp-2 leading-relaxed text-sm">
                        {getDescription(related)}
                      </p>
                      <Link
                        to={`/programmes/${related.id}`}
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors text-sm"
                      >
                        {isRTL ? 'اعرف المزيد' : 'Learn More'}
                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      )}

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto bg-sand p-10 rounded-lg shadow-lg text-center"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-primary mb-4">
              {isRTL ? 'هل أنت مهتم بهذا البرنامج؟' : 'Interested in This Programme?'}
            </h2>
            <p className="text-lg text-muted mb-6">
              {isRTL
                ? 'تواصل معنا لمعرفة المزيد عن كيفية المشاركة أو الانضمام إلى مجتمعنا'
                : 'Get in touch to learn more about how you can participate or join our community.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/contact"
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold inline-block"
                >
                  {isRTL ? 'تواصل معنا' : 'Contact Us'}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/programmes"
                  className="bg-transparent border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold inline-block"
                >
                  {isRTL ? 'عرض جميع البرامج' : 'View All Programmes'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
