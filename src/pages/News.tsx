import { useState, useEffect } from 'react';
import { Calendar, User, Tag, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../lib/animations';
import { supabase } from '../lib/supabase';
import { useContent } from '../contexts/ContentContext';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(6);

  const { getContent } = useContent();
  const c = (key: string, fallback: string) => getContent('news', key, fallback);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Community', 'Education', 'Health', 'Youth', 'Civic Engagement', 'Announcements'];

  const filteredArticles = selectedCategory === 'All'
    ? articles.slice(0, displayCount)
    : articles.filter(article => article.category === selectedCategory).slice(0, displayCount);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return articles.length;
    return articles.filter(article => article.category === category).length;
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    setSubscribeStatus('idle');

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email: subscribeEmail, name: subscribeName || null }]);

      if (error) throw error;

      setSubscribeStatus('success');
      setSubscribeEmail('');
      setSubscribeName('');

      setTimeout(() => {
        setSubscribeStatus('idle');
      }, 5000);
    } catch (err: any) {
      console.error('Error subscribing:', err);
      if (err.code === '23505') {
        setSubscribeStatus('error');
      } else {
        setSubscribeStatus('error');
      }
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="News & Insights"
        description=""
        breadcrumbs={[{ label: 'News' }]}
        pageKey="news"
      />

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
                const colors = [
                  { bg: 'bg-emerald-500', hover: 'hover:border-emerald-500', text: 'text-primary' },
                  { bg: 'bg-blue-500', hover: 'hover:border-blue-500', text: 'text-primary' },
                  { bg: 'bg-amber-500', hover: 'hover:border-amber-500', text: 'text-primary' },
                  { bg: 'bg-rose-500', hover: 'hover:border-rose-500', text: 'text-primary' },
                  { bg: 'bg-teal-500', hover: 'hover:border-teal-500', text: 'text-primary' },
                  { bg: 'bg-purple-500', hover: 'hover:border-purple-500', text: 'text-primary' },
                  { bg: 'bg-orange-500', hover: 'hover:border-orange-500', text: 'text-primary' },
                ];
                const color = colors[index % colors.length];

                return (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-md ${
                      selectedCategory === category
                        ? `${color.bg} text-white border-2 ${color.hover.replace('hover:', '')}`
                        : `bg-white ${color.text} border-2 border-transparent ${color.hover}`
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {category}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      selectedCategory === category
                        ? 'bg-white bg-opacity-20'
                        : 'bg-current bg-opacity-10'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {loading ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <Loader2 size={48} className="text-primary animate-spin mb-4" />
              <p className="text-lg text-muted">Loading articles...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-20 max-w-2xl mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-red-50 rounded-full mb-6">
                <FileText size={48} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">Error Loading Articles</h3>
              <p className="text-lg text-muted mb-8">{error}</p>
              <motion.button
                onClick={fetchArticles}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : filteredArticles.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredArticles.map((article) => (
                <motion.article
                  key={article.id}
                  className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
                  variants={staggerItem}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image_url || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={article.title}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-accent text-primary px-4 py-1 rounded-full text-sm font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(article.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <span>{article.author}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-3 line-clamp-2 group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <Link
                      to={`/news/${article.id}`}
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
                    >
                      Read More <ArrowRight size={18} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20 max-w-2xl mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="inline-flex items-center justify-center w-24 h-24 bg-sand rounded-full mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <FileText size={48} className="text-primary" />
              </motion.div>
              <h3 className="text-2xl font-bold text-primary mb-4">
                No Articles Found
              </h3>
              <p className="text-lg text-muted mb-8">
                There are currently no articles in the "{selectedCategory}" category.
                <br />
                Please check back later or explore other categories.
              </p>
              <motion.button
                onClick={() => setSelectedCategory('All')}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Articles
              </motion.button>
            </motion.div>
          )}

          {!loading && !error && filteredArticles.length > 0 && displayCount < (selectedCategory === 'All' ? articles.length : articles.filter(a => a.category === selectedCategory).length) && (
            <motion.div
              className="flex justify-center mt-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.button
                onClick={handleLoadMore}
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Load More Articles
              </motion.button>
            </motion.div>
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
            <h2 className="text-3xl font-bold text-primary mb-4">{c('newsletter_title', 'Subscribe to Our Newsletter')}</h2>
            <p className="text-lg text-muted mb-6">
              {c('newsletter_desc', 'Get the latest news, events, and community updates delivered directly to your inbox')}
            </p>

            {subscribeStatus === 'success' && (
              <motion.div
                className="bg-green-50 border-2 border-green-500 text-green-800 p-4 rounded-lg mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-semibold">Successfully subscribed! Check your email for confirmation.</p>
              </motion.div>
            )}

            {subscribeStatus === 'error' && (
              <motion.div
                className="bg-red-50 border-2 border-red-500 text-red-800 p-4 rounded-lg mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-semibold">This email is already subscribed or there was an error. Please try again.</p>
              </motion.div>
            )}

            <form onSubmit={handleSubscribe} className="flex flex-col gap-4 max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={subscribeName}
                onChange={(e) => setSubscribeName(e.target.value)}
                className="w-full px-6 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent"
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  required
                  className="flex-1 px-6 py-3 border-2 border-border rounded-lg focus:outline-none focus:border-accent"
                />
                <motion.button
                  type="submit"
                  disabled={subscribing}
                  className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: subscribing ? 1 : 1.05 }}
                  whileTap={{ scale: subscribing ? 1 : 0.95 }}
                >
                  {subscribing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </motion.button>
              </div>
            </form>
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
          <h2 className="text-3xl font-bold mb-4">{c('social_title', 'Follow Us on Social Media')}</h2>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            {c('social_desc', 'Stay connected for real-time updates and community stories')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="#"
              className="bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {c('follow_instagram', 'Follow on Instagram')}
            </motion.a>
            <motion.a
              href="#"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {c('join_facebook', 'Join Facebook Group')}
            </motion.a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
