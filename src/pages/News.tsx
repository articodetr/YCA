import { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, FileText, Loader2 } from 'lucide-react';
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

      <section className="py-16 bg-[#f8fafb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-14"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category, index) => {
                const count = getCategoryCount(category);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
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

          {loading ? (
            <motion.div
              className="flex flex-col items-center justify-center py-24"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <Loader2 size={40} className="text-[#0d9488] animate-spin mb-4" />
              <p className="text-[#64748b]">Loading articles...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-center py-24 max-w-md mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-6">
                <FileText size={36} className="text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f1c2e] mb-3">Error Loading Articles</h3>
              <p className="text-[#64748b] mb-8">{error}</p>
              <button
                onClick={fetchArticles}
                className="bg-[#0d9488] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d9488]/90 transition-colors font-medium"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredArticles.length > 0 ? (
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {filteredArticles.map((article) => (
                <motion.article
                  key={article.id}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  variants={staggerItem}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image_url || 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-[#0d9488] text-white px-3 py-1 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 text-xs text-[#64748b] mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(article.published_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{article.author}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-[#0f1c2e] mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[#64748b] text-sm mb-4 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                    <Link
                      to={`/news/${article.id}`}
                      className="inline-flex items-center gap-1.5 text-[#0d9488] text-sm font-medium hover:gap-2.5 transition-all"
                    >
                      Read More <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-24 max-w-md mx-auto"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <FileText size={36} className="text-[#64748b]" />
              </div>
              <h3 className="text-xl font-semibold text-[#0f1c2e] mb-3">
                No Articles Found
              </h3>
              <p className="text-[#64748b] mb-8">
                There are currently no articles in the "{selectedCategory}" category.
                <br />
                Please check back later or explore other categories.
              </p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="bg-[#0d9488] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d9488]/90 transition-colors font-medium"
              >
                View All Articles
              </button>
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
              <button
                onClick={handleLoadMore}
                className="bg-[#0d9488] text-white px-8 py-2.5 rounded-lg hover:bg-[#0d9488]/90 transition-colors font-medium"
              >
                Load More Articles
              </button>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-xl mx-auto text-center"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-semibold text-[#0f1c2e] mb-2">{c('newsletter_title', 'Subscribe to Our Newsletter')}</h2>
            <p className="text-[#64748b] mb-8">
              {c('newsletter_desc', 'Get the latest news, events, and community updates delivered directly to your inbox')}
            </p>

            {subscribeStatus === 'success' && (
              <motion.div
                className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-6 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-medium">Successfully subscribed! Check your email for confirmation.</p>
              </motion.div>
            )}

            {subscribeStatus === 'error' && (
              <motion.div
                className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="font-medium">This email is already subscribed or there was an error. Please try again.</p>
              </motion.div>
            )}

            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={subscribeName}
                onChange={(e) => setSubscribeName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  required
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0d9488] focus:ring-1 focus:ring-[#0d9488] transition-colors"
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="bg-[#0d9488] text-white px-6 py-2.5 rounded-lg hover:bg-[#0d9488]/90 transition-colors text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {subscribing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
