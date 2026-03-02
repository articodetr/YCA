import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';
import MultiImageUploader from '../../components/admin/MultiImageUploader';

interface Programme {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  content?: string;
  content_ar?: string;
  image_url: string;
  gallery_images?: string[];
  // Category is kept for organisation/filtering in admin. The DB no longer enforces
  // a strict CHECK constraint (see latest migration).
  category: string;
  slug?: string;
  link: string;
  color: string;
  icon: string;
  is_active: boolean;
  order_number: number;
}

const defaultForm = {
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  content: '',
  content_ar: '',
  image_url: '',
  gallery_images: [] as string[],
  category: 'youth' as string,
  slug: '',
  link: '',
  color: '#10B981',
  icon: 'Users',
  is_active: true,
  order_number: 0,
};

const CATEGORY_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'women', label: 'Women' },
  { value: 'women_children', label: 'Women & Children' },
  { value: 'elderly', label: 'Elderly' },
  { value: 'youth', label: 'Youth' },
  { value: 'children', label: 'Children' },
  { value: 'education', label: 'Education' },
  { value: 'men', label: 'Men' },
  { value: 'activities_sports', label: 'Activities & Sports' },
  { value: 'journey', label: 'Journey Within' },
];

export default function ProgrammesManagement() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<Programme | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchProgrammes();
  }, []);

  const fetchProgrammes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programmes_items')
        .select('*')
        .order('category', { ascending: true })
        .order('order_number', { ascending: true });

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

    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        title_ar: formData.title_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        content: formData.content,
        content_ar: formData.content_ar,
        image_url: formData.image_url,
        gallery_images: formData.gallery_images,
        category: formData.category,
        slug: formData.slug || null,
        link: formData.link,
        color: formData.color,
        icon: formData.icon,
        is_active: formData.is_active,
        order_number: formData.order_number,
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
      fetchProgrammes();
    } catch (error: any) {
      console.error('Error deleting programme:', error);
      alert('Failed to delete programme');
    }
  };

  const toggleActive = async (programme: Programme) => {
    try {
      const { error } = await supabase
        .from('programmes_items')
        .update({ is_active: !programme.is_active })
        .eq('id', programme.id);

      if (error) throw error;
      fetchProgrammes();
    } catch (error: any) {
      console.error('Error toggling programme:', error);
      alert('Failed to update programme status');
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingProgramme(null);
    setShowForm(false);
  };

  const startEdit = (programme: Programme) => {
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
      category: programme.category,
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

  const filteredProgrammes = filterCategory === 'all'
    ? programmes
    : programmes.filter(p => p.category === filterCategory);

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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g. women, youth, journey-within"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Used in URL: /programmes/<strong>{formData.slug || 'slug'}</strong></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                  onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
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
        {['all', ...CATEGORY_OPTIONS.map((o) => o.value)].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filterCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-primary hover:bg-gray-300'
            }`}
          >
            {cat === 'all'
              ? 'All'
              : (CATEGORY_OPTIONS.find((o) => o.value === cat)?.label || cat)}
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
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-primary text-lg">{programme.title}</h3>
                <button
                  onClick={() => toggleActive(programme)}
                  className={`p-1 rounded ${programme.is_active ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {programme.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              <p className="text-sm text-muted mb-3 line-clamp-2">{programme.description}</p>
              {programme.slug && (
                <p className="text-xs text-gray-400 mb-2">/programmes/{programme.slug}</p>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: programme.color }}
                >
                  {programme.category}
                </span>
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
