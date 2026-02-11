import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  order_number: number;
  is_active: boolean;
  created_at: string;
}

export default function HeroManagement() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    subtitle: '',
    description_ar: '',
    image_url: '',
    order_number: 0,
    is_active: true
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_number', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error: any) {
      console.error('Error fetching slides:', error);
      alert('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingSlide) {
        const { error } = await supabase
          .from('hero_slides')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSlide.id);

        if (error) throw error;
        alert('Hero slide updated successfully!');
      } else {
        const { error } = await supabase
          .from('hero_slides')
          .insert([formData]);

        if (error) throw error;
        alert('Hero slide created successfully!');
      }

      resetForm();
      fetchSlides();
    } catch (error: any) {
      console.error('Error saving slide:', error);
      alert('Failed to save hero slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero slide?')) return;

    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Hero slide deleted successfully!');
      fetchSlides();
    } catch (error: any) {
      console.error('Error deleting slide:', error);
      alert('Failed to delete hero slide');
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !slide.is_active })
        .eq('id', slide.id);

      if (error) throw error;
      fetchSlides();
    } catch (error: any) {
      console.error('Error toggling slide:', error);
      alert('Failed to update slide status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      title_ar: '',
      subtitle: '',
      description_ar: '',
      image_url: '',
      order_number: 0,
      is_active: true
    });
    setEditingSlide(null);
    setShowForm(false);
  };

  const startEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      title_ar: (slide as any).title_ar || '',
      subtitle: slide.subtitle,
      description_ar: (slide as any).description_ar || '',
      image_url: slide.image_url,
      order_number: slide.order_number,
      is_active: slide.is_active
    });
    setShowForm(true);
  };

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
        <h1 className="text-3xl font-bold text-primary">Hero Section Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Slide
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic) <span className="text-gray-400">العنوان</span></label>
              <input
                type="text"
                value={formData.title_ar || ''}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                dir="rtl"
                placeholder="أدخل العنوان بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Arabic) <span className="text-gray-400">العنوان الفرعي</span></label>
              <input
                type="text"
                value={formData.description_ar || ''}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                dir="rtl"
                placeholder="أدخل العنوان الفرعي بالعربية"
              />
            </div>

            <ImageUploader
              bucket="hero-images"
              currentImage={formData.image_url}
              onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
              label="Hero Image *"
            />

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Order Number
              </label>
              <input
                type="number"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-semibold text-primary">
                Active (visible on website)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {editingSlide ? 'Update Slide' : 'Create Slide'}
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-sand">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Order</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Preview</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Title</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {slides.map((slide) => (
              <tr key={slide.id} className="hover:bg-sand transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <GripVertical size={20} className="text-gray-400" />
                    <span className="font-semibold text-primary">{slide.order_number}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-primary">{slide.title}</p>
                    {slide.subtitle && (
                      <p className="text-sm text-muted">{slide.subtitle}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleActive(slide)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                      slide.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {slide.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(slide)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {slides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">No hero slides found. Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
