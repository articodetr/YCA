import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';
import MultiImageUploader from '../../components/admin/MultiImageUploader';

const markdownHintEn = '[link text](https://example.com)';
const markdownHintAr = '[نص الرابط](https://example.com)';

interface Programme {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  image_url?: string | null;
  gallery_images?: string[];
  category?: string | null;
  slug?: string | null;
  link?: string | null;
  color?: string | null;
  icon?: string | null;
  is_active: boolean;
  order_number: number;
  created_at?: string;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const buildCategoryValue = (title: string, slug: string, customCategory: string) => {
  const source = customCategory.trim() || slug.trim() || slugify(title);
  return source.replace(/-/g, '_');
};

const defaultForm = {
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  content: '',
  content_ar: '',
  image_url: '',
  gallery_images: [] as string[],
  category: '',
  slug: '',
  link: '',
  color: '#10B981',
  icon: 'Users',
  is_active: true,
  order_number: 0,
};

export default function ProgrammesManagement() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);
  const [filterSlug, setFilterSlug] = useState<string>('all');
  const [formData, setFormData] = useState(defaultForm);
  const [linkHelper, setLinkHelper] = useState({
    descriptionTextEn: '',
    descriptionUrlEn: '',
    descriptionTextAr: '',
    descriptionUrlAr: '',
    contentTextEn: '',
    contentUrlEn: '',
    contentTextAr: '',
    contentUrlAr: '',
  });

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programmes_items')
        .select('*')
        .order('order_number', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProgrammes(data || []);
    } catch (error: any) {
      console.error('Error fetching programmes:', error);
      alert('Failed to load programmes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = formData.title.trim();
    const cleanDescription = formData.description.trim();
    const cleanSlug = slugify(formData.slug || formData.title);

    if (!cleanTitle || !cleanDescription || !cleanSlug) {
      alert('Please fill in title, description, and slug');
      return;
    }

    try {
      const payload = {
        title: cleanTitle,
        title_ar: formData.title_ar.trim(),
        description: cleanDescription,
        description_ar: formData.description_ar.trim(),
        content: formData.content.trim(),
        content_ar: formData.content_ar.trim(),
        image_url: formData.image_url || null,
        gallery_images: formData.gallery_images,
        category: buildCategoryValue(cleanTitle, cleanSlug, formData.category),
        slug: cleanSlug,
        link: formData.link.trim() || null,
        color: formData.color,
        icon: formData.icon.trim() || 'Users',
        is_active: formData.is_active,
        order_number: Number.isFinite(formData.order_number) ? formData.order_number : 0,
        updated_at: new Date().toISOString(),
      };

      if (editingProgramme) {
        const { error } = await supabase
          .from('programmes_items')
          .update(payload)
          .eq('id', editingProgramme.id);

        if (error) throw error;
        alert('Programme updated successfully!');
      } else {
        const { error } = await supabase
          .from('programmes_items')
          .insert([payload]);

        if (error) throw error;
        alert('Programme added successfully!');
      }

      resetForm();
      fetchProgrammes();
    } catch (error: any) {
      console.error('Error saving programme:', error);
      alert('Failed to save programme: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this programme?')) return;

    try {
      const { error } = await supabase
        .from('programmes_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Programme deleted successfully!');
      if (editingProgramme?.id === id) {
        resetForm();
      }
      fetchProgrammes();
    } catch (error: any) {
      console.error('Error deleting programme:', error);
      alert('Failed to delete programme: ' + error.message);
    }
  };

  const toggleActive = async (programme: Programme) => {
    try {
      const { error } = await supabase
        .from('programmes_items')
        .update({ is_active: !programme.is_active, updated_at: new Date().toISOString() })
        .eq('id', programme.id);

      if (error) throw error;
      fetchProgrammes();
    } catch (error: any) {
      console.error('Error toggling programme:', error);
      alert('Failed to update programme status');
    }
  };

  const resetLinkHelper = () => {
    setLinkHelper({
      descriptionTextEn: '',
      descriptionUrlEn: '',
      descriptionTextAr: '',
      descriptionUrlAr: '',
      contentTextEn: '',
      contentUrlEn: '',
      contentTextAr: '',
      contentUrlAr: '',
    });
  };

  const insertMarkdownLink = (field: 'description' | 'description_ar' | 'content' | 'content_ar') => {
    const isArabic = field === 'description_ar' || field === 'content_ar';
    const isContent = field === 'content' || field === 'content_ar';
    const textKey = isContent
      ? (isArabic ? 'contentTextAr' : 'contentTextEn')
      : (isArabic ? 'descriptionTextAr' : 'descriptionTextEn');
    const urlKey = isContent
      ? (isArabic ? 'contentUrlAr' : 'contentUrlEn')
      : (isArabic ? 'descriptionUrlAr' : 'descriptionUrlEn');

    const label = (linkHelper as any)[textKey].trim();
    const url = (linkHelper as any)[urlKey].trim();

    if (!label || !url) {
      alert(isArabic ? 'أدخل نص الرابط والرابط (URL) أولاً' : 'Please enter both the link text and URL first');
      return;
    }

    const markdown = `[${label}](${url})`;
    const current = (formData as any)[field] || '';
    const spacer = current && !current.endsWith('\n') ? '\n' : '';

    setFormData({
      ...formData,
      [field]: `${current}${spacer}${markdown}`,
    } as any);

    setLinkHelper((prev) => ({
      ...prev,
      [textKey]: '',
      [urlKey]: '',
    }));
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingProgramme(null);
    setShowForm(false);
    resetLinkHelper();
  };

  const startEdit = (programme: Programme) => {
    resetLinkHelper();
    setEditingProgramme(programme);
    setFormData({
      title: programme.title,
      title_ar: programme.title_ar || '',
      description: programme.description,
      description_ar: programme.description_ar || '',
      content: programme.content || '',
      content_ar: programme.content_ar || '',
      image_url: programme.image_url || '',
      gallery_images: programme.gallery_images || [],
      category: programme.category || '',
      slug: programme.slug || '',
      link: programme.link || '',
      color: programme.color || '#10B981',
      icon: programme.icon || 'Users',
      is_active: programme.is_active,
      order_number: programme.order_number,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filterOptions = useMemo(() => {
    const seen = new Set<string>();
    return programmes
      .filter((programme) => {
        const slug = (programme.slug || '').trim();
        if (!slug || seen.has(slug)) return false;
        seen.add(slug);
        return true;
      })
      .map((programme) => ({
        value: (programme.slug || '').trim(),
        label: programme.title,
      }));
  }, [programmes]);

  const filteredProgrammes = filterSlug === 'all'
    ? programmes
    : programmes.filter((programme) => (programme.slug || '').trim() === filterSlug);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Programmes Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Programme
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {editingProgramme ? 'Edit Programme' : 'Add New Programme'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Title (English) *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const nextTitle = e.target.value;
                    const nextSlug = editingProgramme ? formData.slug : slugify(nextTitle);
                    setFormData({ ...formData, title: nextTitle, slug: nextSlug });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Title (Arabic) <span className="text-gray-400">العنوان</span></label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir="rtl"
                  placeholder="أدخل العنوان بالعربية"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Short Description (English) *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={3}
                  required
                />
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Insert a clickable link</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      value={linkHelper.descriptionTextEn}
                      onChange={(e) => setLinkHelper({ ...linkHelper, descriptionTextEn: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Link text"
                    />
                    <input
                      value={linkHelper.descriptionUrlEn}
                      onChange={(e) => setLinkHelper({ ...linkHelper, descriptionUrlEn: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => insertMarkdownLink('description')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold px-3 py-2"
                    >
                      Add link
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use <span className="font-mono bg-white px-1.5 py-0.5 rounded border">{markdownHintEn}</span> or paste a full URL.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Short Description (Arabic) <span className="text-gray-400">الوصف المختصر</span></label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  dir="rtl"
                  placeholder="أدخل الوصف المختصر"
                />
                <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3" dir="rtl">
                  <p className="text-xs text-gray-600 mb-2 font-medium">إضافة رابط قابل للنقر</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" dir="rtl">
                    <input
                      value={linkHelper.descriptionTextAr}
                      onChange={(e) => setLinkHelper({ ...linkHelper, descriptionTextAr: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="نص الرابط"
                    />
                    <input
                      value={linkHelper.descriptionUrlAr}
                      onChange={(e) => setLinkHelper({ ...linkHelper, descriptionUrlAr: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="https://..."
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => insertMarkdownLink('description_ar')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold px-3 py-2"
                    >
                      إضافة الرابط
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2" dir="rtl">
                    استخدم <span className="font-mono bg-white px-1.5 py-0.5 rounded border" dir="ltr">{markdownHintAr}</span> أو ألصق رابطًا مباشرًا.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-bold text-primary mb-3">Full Content (shown on detail page)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Full Content (English)</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    rows={8}
                    placeholder="Enter full programme details, activities, eligibility, etc."
                  />
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-2 font-medium">Insert a clickable link inside the full content</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        value={linkHelper.contentTextEn}
                        onChange={(e) => setLinkHelper({ ...linkHelper, contentTextEn: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Link text"
                      />
                      <input
                        value={linkHelper.contentUrlEn}
                        onChange={(e) => setLinkHelper({ ...linkHelper, contentUrlEn: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => insertMarkdownLink('content')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold px-3 py-2"
                      >
                        Add link
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Links in the full content will appear clickable on the programme page.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary mb-2">Full Content (Arabic) <span className="text-gray-400">المحتوى الكامل</span></label>
                  <textarea
                    value={formData.content_ar}
                    onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    dir="rtl"
                    placeholder="أدخل تفاصيل البرنامج الكاملة"
                  />
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3" dir="rtl">
                    <p className="text-xs text-gray-600 mb-2 font-medium">إضافة رابط قابل للنقر داخل المحتوى الكامل</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" dir="rtl">
                      <input
                        value={linkHelper.contentTextAr}
                        onChange={(e) => setLinkHelper({ ...linkHelper, contentTextAr: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="نص الرابط"
                      />
                      <input
                        value={linkHelper.contentUrlAr}
                        onChange={(e) => setLinkHelper({ ...linkHelper, contentUrlAr: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="https://..."
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => insertMarkdownLink('content_ar')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold px-3 py-2"
                      >
                        إضافة الرابط
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2" dir="rtl">
                      الروابط داخل المحتوى الكامل ستظهر قابلة للنقر في صفحة البرنامج.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-bold text-primary mb-3">Images</h3>
              <ImageUploader
                bucket="programmes"
                currentImage={formData.image_url}
                onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                label="Main Programme Image (Cover)"
              />
              <div className="mt-4">
                <MultiImageUploader
                  bucket="programmes"
                  images={formData.gallery_images}
                  onChange={(imgs) => setFormData({ ...formData, gallery_images: imgs })}
                  label="Photo Gallery (additional images)"
                  maxImages={12}
                />
              </div>
            </div>

            <div className="border-t pt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">
                  Slug (URL path) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. women-children, youth, journey-within"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Used in URL: /programmes/<strong>{formData.slug || 'slug'}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Internal Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Optional. Auto-generated from slug if left empty"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Icon (Lucide name)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Users"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Card Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order_number}
                  onChange={(e) => setFormData({ ...formData, order_number: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-primary">Active (visible on website)</label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {editingProgramme ? 'Update Programme' : 'Add Programme'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-primary px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterSlug('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            filterSlug === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-primary hover:bg-gray-300'
          }`}
        >
          All
        </button>
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterSlug(option.value)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterSlug === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-primary hover:bg-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProgrammes.map((programme) => (
          <div key={programme.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {programme.image_url && (
              <img
                src={programme.image_url}
                alt={programme.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2 gap-3">
                <h3 className="font-bold text-primary text-lg">{programme.title}</h3>
                <button
                  onClick={() => toggleActive(programme)}
                  className={`p-1 rounded shrink-0 ${programme.is_active ? 'text-green-600' : 'text-gray-400'}`}
                  title={programme.is_active ? 'Hide programme from website' : 'Show programme on website'}
                >
                  {programme.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p className="text-sm text-muted mb-3 line-clamp-2">{programme.description}</p>
              {programme.slug && (
                <p className="text-xs text-gray-400 mb-2">/programmes/{programme.slug}</p>
              )}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: programme.color || '#10B981' }}
                >
                  {programme.title}
                </span>
                {!programme.is_active && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-700">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(programme)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(programme.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProgrammes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-muted">No programmes found.</p>
        </div>
      )}
    </div>
  );
}
