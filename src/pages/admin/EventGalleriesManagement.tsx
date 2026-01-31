import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';

interface Event {
  id: string;
  title: string;
}

interface GalleryImage {
  id: string;
  event_id: string;
  image_url: string;
  caption: string;
  description: string;
  order_number: number;
  created_at: string;
}

export default function EventGalleriesManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    event_id: '',
    image_url: '',
    caption: '',
    description: '',
    order_number: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchGalleryImages();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
      if (data && data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      alert('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('event_gallery')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('order_number', { ascending: true });

      if (error) throw error;
      setGalleryImages(data || []);
    } catch (error: any) {
      console.error('Error fetching gallery images:', error);
      alert('Failed to load gallery images');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      alert('Please upload an image');
      return;
    }

    const dataToSave = {
      ...formData,
      event_id: selectedEventId
    };

    try {
      if (editingImage) {
        const { error } = await supabase
          .from('event_gallery')
          .update(dataToSave)
          .eq('id', editingImage.id);

        if (error) throw error;
        alert('Gallery image updated successfully!');
      } else {
        const { error } = await supabase
          .from('event_gallery')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Gallery image added successfully!');
      }

      resetForm();
      fetchGalleryImages();
    } catch (error: any) {
      console.error('Error saving gallery image:', error);
      alert('Failed to save gallery image');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery image?')) return;

    try {
      const { error } = await supabase
        .from('event_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Gallery image deleted successfully!');
      fetchGalleryImages();
    } catch (error: any) {
      console.error('Error deleting gallery image:', error);
      alert('Failed to delete gallery image');
    }
  };

  const resetForm = () => {
    setFormData({
      event_id: selectedEventId,
      image_url: '',
      caption: '',
      description: '',
      order_number: 0
    });
    setEditingImage(null);
    setShowForm(false);
  };

  const startEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setFormData({
      event_id: image.event_id,
      image_url: image.image_url,
      caption: image.caption || '',
      description: image.description || '',
      order_number: image.order_number
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
        <h1 className="text-3xl font-bold text-primary">Event Galleries Management</h1>
        {selectedEventId && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Image
          </button>
        )}
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <label className="block text-sm font-semibold text-primary mb-2">
          Select Event
        </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">-- Select an Event --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title}
            </option>
          ))}
        </select>
      </div>

      {!selectedEventId && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <ImageIcon size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-muted">Please select an event to manage its gallery</p>
        </div>
      )}

      {selectedEventId && showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            {editingImage ? 'Edit Gallery Image' : 'Add Gallery Image'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUploader
              bucket="event-gallery"
              currentImage={formData.image_url}
              onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
              label="Gallery Image *"
            />

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Caption
              </label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief caption for the image"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                placeholder="Detailed description of the image"
              />
            </div>

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

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                {editingImage ? 'Update Image' : 'Add Image'}
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

      {selectedEventId && !showForm && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={image.image_url}
                  alt={image.caption || 'Gallery image'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                {image.caption && (
                  <h3 className="font-semibold text-primary mb-2">{image.caption}</h3>
                )}
                {image.description && (
                  <p className="text-sm text-muted mb-3 line-clamp-2">{image.description}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(image)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
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
      )}

      {selectedEventId && galleryImages.length === 0 && !showForm && (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <ImageIcon size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-muted mb-4">No gallery images found for this event</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add First Image
          </button>
        </div>
      )}
    </div>
  );
}
