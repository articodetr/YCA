import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, X, Images } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';
import MultiImageUploader from '../../components/admin/MultiImageUploader';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  published_at: string;
  image_url: string | null;
  gallery_images: string[];
  programme_id?: string | null;
}

interface ProgrammeOption {
  id: string;
  title: string;
  title_ar?: string;
  slug?: string;
}

export default function NewsManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [programmeOptions, setProgrammeOptions] = useState<ProgrammeOption[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    excerpt: '',
    description_ar: '',
    content: '',
    content_ar: '',
    category: 'Community',
    author: 'YCA Birmingham',
    image_url: '',
    gallery_images: [] as string[],
    programme_id: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      const { data, error } = await supabase
        .from('programmes_items')
        .select('id,title,title_ar,slug')
        .eq('is_active', true)
        .order('order_number', { ascending: true });

      if (error) throw error;
      setProgrammeOptions(data || []);
    } catch (error) {
      console.error('Error fetching programmes:', error);
      setProgrammeOptions([]);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        title_ar: (article as any).title_ar || '',
        excerpt: article.excerpt,
        description_ar: (article as any).description_ar || '',
        content: article.content,
        content_ar: (article as any).content_ar || '',
        category: article.category,
        author: article.author,
        image_url: article.image_url || '',
        gallery_images: Array.isArray(article.gallery_images) ? article.gallery_images : [],
        programme_id: (article as any).programme_id || '',
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        title_ar: '',
        excerpt: '',
        description_ar: '',
        content: '',
        content_ar: '',
        category: 'Community',
        author: 'YCA Birmingham',
        image_url: '',
        gallery_images: [],
        programme_id: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingArticle(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const articleData: Record<string, any> = {
        title: formData.title,
        title_ar: formData.title_ar || null,
        excerpt: formData.excerpt,
        description_ar: formData.description_ar || null,
        content: formData.content,
        content_ar: formData.content_ar || null,
        category: formData.category,
        author: formData.author,
        image_url: formData.image_url || null,
        gallery_images: formData.gallery_images,
        programme_id: formData.programme_id ? formData.programme_id : null,
        published_at: editingArticle?.published_at || new Date().toISOString(),
      };

      const saveArticle = async (data: Record<string, any>) => {
        if (editingArticle) {
          return supabase.from('news').update(data).eq('id', editingArticle.id);
        }
        return supabase.from('news').insert([data]);
      };

      let { error } = await saveArticle(articleData);

      if (error && error.message?.includes('gallery_images')) {
        const { gallery_images, ...withoutGallery } = articleData;
        const retry = await saveArticle(withoutGallery);
        error = retry.error;
      }

      if (error) throw error;

      await fetchArticles();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase.from('news').delete().eq('id', id);

      if (error) throw error;
      await fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article. Please try again.');
    }
  };

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgrammeLabel = (p: ProgrammeOption) => {
    const en = (p.title || '').trim();
    const ar = (p.title_ar || '').trim();
    return ar ? `${en} — ${ar}` : en;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <p className="text-gray-600 mt-1">Manage news articles and updates</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Article
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No articles found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Author
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Images
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    Published
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{article.excerpt}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{article.category}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{article.author}</td>
                    <td className="px-4 py-4">
                      {(Array.isArray(article.gallery_images) && article.gallery_images.length > 0) ? (
                        <span className="inline-flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                          <Images className="w-3.5 h-3.5" />
                          {article.gallery_images.length}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">--</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(article.published_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(article)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic) <span className="text-gray-400">العنوان</span></label>
                <input
                  type="text"
                  value={formData.title_ar || ''}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  dir="rtl"
                  placeholder="أدخل العنوان بالعربية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Community">Community</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Youth">Youth</option>
                  <option value="Civic Engagement">Civic Engagement</option>
                  <option value="Announcements">Announcements</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Programme (optional)</label>
                <select
                  value={formData.programme_id}
                  onChange={(e) => setFormData({ ...formData, programme_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">-- None --</option>
                  {programmeOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {getProgrammeLabel(p)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">If selected, this article will appear under that programme.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <ImageUploader
                  bucket="news-images"
                  currentImage={formData.image_url}
                  onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                  label="Cover Image (optional)"
                  maxSizeMB={5}
                />
              </div>

              <div>
                <MultiImageUploader
                  bucket="news-images"
                  images={formData.gallery_images}
                  onChange={(imgs) => setFormData({ ...formData, gallery_images: imgs })}
                  label="Gallery Images (optional)"
                  maxImages={10}
                  maxSizeMB={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (Arabic) <span className="text-gray-400">الوصف</span></label>
                <textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  dir="rtl"
                  placeholder="أدخل الوصف بالعربية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Links are supported. Use{' '}
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">[link text](https://example.com)</span>
                  {' '}or paste a full URL (https://...) and it will be clickable.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Arabic) <span className="text-gray-400">المحتوى</span></label>
                <textarea
                  value={formData.content_ar || ''}
                  onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  dir="rtl"
                  placeholder="أدخل المحتوى بالعربية"
                />
                <p className="text-xs text-gray-500 mt-2" dir="rtl">
                  يمكنك إضافة روابط داخل النص. استخدم الصيغة:
                  {' '}
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded" dir="ltr">[نص الرابط](https://example.com)</span>
                  {' '}أو ضع رابطًا مباشرًا (https://...) وسيظهر قابلًا للضغط.
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
