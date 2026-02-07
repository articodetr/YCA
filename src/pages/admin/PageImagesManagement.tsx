import { useState, useEffect } from 'react';
import { Save, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import ImageUploader from '../../components/admin/ImageUploader';

interface PageImage {
  id: string;
  page_key: string;
  image_key: string;
  image_url: string;
  alt_text: string;
  alt_text_ar: string;
  is_active: boolean;
}

const PAGE_GROUPS = [
  {
    label: 'Home Page',
    pages: ['home'],
  },
  {
    label: 'Main Pages',
    pages: ['services', 'programmes', 'events', 'news', 'contact', 'resources'],
  },
  {
    label: 'About Pages',
    pages: ['about_mission', 'about_history', 'about_team', 'about_partners', 'about_reports'],
  },
  {
    label: 'Get Involved',
    pages: ['donate', 'volunteer', 'membership', 'jobs', 'partnerships'],
  },
  {
    label: 'Programme Pages',
    pages: ['programmes_women', 'programmes_men', 'programmes_youth', 'programmes_children', 'programmes_elderly', 'programmes_journey'],
  },
];

const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function PageImagesManagement() {
  const [images, setImages] = useState<PageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeGroup, setActiveGroup] = useState(0);
  const [editedUrls, setEditedUrls] = useState<Record<string, string>>({});
  const { refreshSettings } = useSiteSettings();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('page_images')
        .select('*')
        .order('page_key')
        .order('image_key');

      if (error) throw error;
      setImages(data || []);

      const urlMap: Record<string, string> = {};
      data?.forEach((img) => {
        urlMap[img.id] = img.image_url;
      });
      setEditedUrls(urlMap);
    } catch (error) {
      console.error('Error fetching images:', error);
      setMessage('Error loading images');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      for (const [id, url] of Object.entries(editedUrls)) {
        const original = images.find((img) => img.id === id);
        if (original && original.image_url !== url) {
          const { error } = await supabase
            .from('page_images')
            .update({ image_url: url, updated_at: new Date().toISOString() })
            .eq('id', id);
          if (error) throw error;
        }
      }

      await refreshSettings();
      await fetchImages();
      setMessage('Images saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving images:', error);
      setMessage('Error saving images');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (id: string, url: string) => {
    setEditedUrls((prev) => ({ ...prev, [id]: url }));
  };

  const currentPages = PAGE_GROUPS[activeGroup].pages;
  const filteredImages = images.filter((img) => currentPages.includes(img.page_key));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Page Images</h1>
          <p className="text-muted mt-2">Manage background and section images for all pages</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {saving ? (
            <><RefreshCw className="animate-spin" size={20} /> Saving...</>
          ) : (
            <><Save size={20} /> Save All Changes</>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {PAGE_GROUPS.map((group, idx) => (
              <button
                key={idx}
                onClick={() => setActiveGroup(idx)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap text-sm ${
                  activeGroup === idx
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-primary'
                }`}
              >
                <ImageIcon size={18} />
                {group.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-muted">No images configured for these pages yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredImages.map((img) => (
                <div key={img.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors">
                  <div className="aspect-video bg-gray-100 relative">
                    {editedUrls[img.id] ? (
                      <img
                        src={editedUrls[img.id]}
                        alt={img.alt_text}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={40} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-primary">{formatKey(img.page_key)}</p>
                    <p className="text-xs text-muted mb-3">{formatKey(img.image_key)}</p>
                    <ImageUploader
                      bucket="content-images"
                      currentImage={editedUrls[img.id] || null}
                      onUploadSuccess={(url) => handleImageUpload(img.id, url)}
                      label="Replace Image"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
