import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  ArrowLeft,
  ArrowRight,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Loader2,
  AlertCircle
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
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
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
                        onClick={() => handleShare('twitter')}
                        className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={isRTL ? 'مشاركة على تويتر' : 'Share on Twitter'}
                      >
                        <Twitter size={20} />
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
          </motion.div>
        </div>
      </article>

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
