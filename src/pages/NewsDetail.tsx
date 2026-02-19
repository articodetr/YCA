import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Clock,
  Share2,
  Facebook,
  Linkedin,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Images
} from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Article {
  id: string;
  title: string;
  title_ar?: string;
  excerpt: string;
  description_ar?: string;
  content: string;
  content_ar?: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
  gallery_images?: string[];
}

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = article
    ? [
        ...(article.image_url ? [article.image_url] : []),
        ...(Array.isArray(article.gallery_images) ? article.gallery_images : []),
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
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('news')
        .select('*, title_ar, content_ar, description_ar')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError(isRTL ? 'المقال غير موجود' : 'Article not found');
        setLoading(false);
        return;
      }

      setArticle(data);

      const { data: related, error: relatedError } = await supabase
        .from('news')
        .select('*, title_ar, content_ar, description_ar')
        .eq('category', data.category)
        .neq('id', id)
        .order('published_at', { ascending: false })
        .limit(3);

      if (relatedError) throw relatedError;
      setRelatedArticles(related || []);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError(isRTL ? 'فشل تحميل المقال. يرجى المحاولة مرة أخرى لاحقا.' : 'Failed to load article. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title || '';

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

  const getArticleTitle = (a: Article) => isRTL && a.title_ar ? a.title_ar : a.title;
  const getArticleContent = (a: Article) => isRTL && a.content_ar ? a.content_ar : a.content;
  const getArticleExcerpt = (a: Article) => isRTL && a.description_ar ? a.description_ar : a.excerpt;

  if (loading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-sand" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          className="flex flex-col items-center justify-center"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <Loader2 size={64} className="text-primary animate-spin mb-4" />
          <p className="text-xl text-muted">{isRTL ? '...جار تحميل المقال' : 'Loading article...'}</p>
        </motion.div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-sand" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div
          className="text-center py-32 max-w-2xl mx-auto px-4"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
            <AlertCircle size={48} className="text-red-500" />
          </div>
          <h3 className="text-3xl font-bold text-primary mb-4">{isRTL ? 'المقال غير موجود' : 'Article Not Found'}</h3>
          <p className="text-lg text-muted mb-8">
            {error || (isRTL ? 'المقال الذي تبحث عنه غير موجود أو تمت إزالته.' : 'The article you are looking for does not exist or has been removed.')}
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              onClick={() => navigate('/news')}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold inline-flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {isRTL ? 'العودة إلى الأخبار' : 'Back to News'}
            </motion.button>
            <motion.button
              onClick={fetchArticle}
              className="bg-sand text-primary px-8 py-3 rounded-lg hover:bg-accent transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const articleTitle = getArticleTitle(article);
  const articleContent = getArticleContent(article);
  const readingTime = calculateReadingTime(articleContent);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <section className="relative h-[600px] md:h-[700px] overflow-hidden pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${article.image_url || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1920'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80"></div>
        </div>

        <div className="relative h-full container mx-auto px-4 flex flex-col justify-between py-12">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-white hover:text-accent transition-colors font-semibold bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              {isRTL ? 'العودة إلى الأخبار' : 'Back to News'}
            </Link>
          </motion.div>

          <motion.div
            className="max-w-5xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block bg-green-600 text-white px-5 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wide">
              {article.category}
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {articleTitle}
            </h1>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <User size={20} />
                <span className="text-base md:text-lg font-medium">{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span className="text-base md:text-lg">{new Date(article.published_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <article className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-muted">
                <Clock size={18} />
                <span>{isRTL ? `${readingTime} دقائق للقراءة` : `${readingTime} min read`}</span>
              </div>

              <div className={`relative ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                <motion.button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold inline-flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 size={18} />
                  {isRTL ? 'مشاركة المقال' : 'Share Article'}
                </motion.button>

                {showShareMenu && (
                  <motion.div
                    className={`absolute top-full mt-2 ${isRTL ? 'left-0' : 'right-0'} bg-white shadow-xl rounded-lg p-4 z-10 border-2 border-border`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex gap-3">
                      <motion.button
                        onClick={() => handleShare('facebook')}
                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isRTL ? 'مشاركة على فيسبوك' : 'Share on Facebook'}
                      >
                        <Facebook size={20} />
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare('x')}
                        className="p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isRTL ? 'مشاركة على X' : 'Share on X'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare('whatsapp')}
                        className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isRTL ? 'مشاركة على واتساب' : 'Share on WhatsApp'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </motion.button>
                      <motion.button
                        onClick={() => handleShare('linkedin')}
                        className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isRTL ? 'مشاركة على لينكدإن' : 'Share on LinkedIn'}
                      >
                        <Linkedin size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <div className="text-muted leading-relaxed space-y-6 text-lg">
                {articleContent.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex items-center gap-3 mb-6">
                  <Images size={24} className="text-primary" />
                  <h3 className="text-2xl font-bold text-primary">
                    {isRTL ? 'معرض الصور' : 'Photo Gallery'}
                  </h3>
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
                        alt={`${articleTitle} - ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
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
              alt={`${articleTitle} - ${lightboxIndex + 1}`}
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

      {relatedArticles.length > 0 && (
        <section className="py-16 bg-sand">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl font-bold text-primary text-center mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {isRTL ? 'مقالات ذات صلة' : 'Related Articles'}
            </motion.h2>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {relatedArticles.map((relatedArticle) => (
                <motion.article
                  key={relatedArticle.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={relatedArticle.image_url || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={getArticleTitle(relatedArticle)}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'}`}>
                      <span className="bg-accent text-primary px-4 py-1 rounded-full text-sm font-semibold">
                        {relatedArticle.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(relatedArticle.published_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-GB', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {getArticleTitle(relatedArticle)}
                    </h3>
                    <p className="text-muted mb-4 line-clamp-2 leading-relaxed">
                      {getArticleExcerpt(relatedArticle)}
                    </p>
                    <Link
                      to={`/news/${relatedArticle.id}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
                    >
                      {isRTL ? 'اقرأ المزيد' : 'Read More'} {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                    </Link>
                  </div>
                </motion.article>
              ))}
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
              {isRTL ? 'هل تريد المزيد من أخبار المجتمع؟' : 'Want More Community News?'}
            </h2>
            <p className="text-lg text-muted mb-6">
              {isRTL
                ? 'اشترك في نشرتنا الإخبارية لتلقي آخر التحديثات والقصص من YCA برمنغهام'
                : 'Subscribe to our newsletter to receive the latest updates and stories from YCA Birmingham'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => navigate('/news')}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRTL ? 'عرض جميع الأخبار' : 'View All News'}
              </motion.button>
              <motion.a
                href="#subscribe"
                className="bg-transparent border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRTL ? 'اشترك في النشرة الإخبارية' : 'Subscribe to Newsletter'}
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
