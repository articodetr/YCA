import { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Home, Mail, Info, DollarSign, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';
import ImageUploader from '../../components/admin/ImageUploader';

interface ContentSection {
  id: string;
  page: string;
  section_key: string;
  content: { text: string; image?: string };
  is_active: boolean;
}

export default function ContentManagement() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [editedImages, setEditedImages] = useState<Record<string, string>>({});
  const [showImageUpload, setShowImageUpload] = useState<Record<string, boolean>>({});
  const { refreshContent } = useContent();

  const pages = [
    { id: 'home', name: 'Home Page', icon: Home },
    { id: 'services', name: 'Services Page', icon: FileText },
    { id: 'contact', name: 'Contact Page', icon: Mail },
    { id: 'footer', name: 'Footer', icon: Info },
    { id: 'about_mission', name: 'About/Mission', icon: Info },
    { id: 'donate', name: 'Donate Page', icon: DollarSign },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('page', { ascending: true })
        .order('section_key', { ascending: true });

      if (error) throw error;

      setContentSections(data || []);

      const contentMap: Record<string, string> = {};
      const imageMap: Record<string, string> = {};
      data?.forEach((section) => {
        contentMap[section.id] = section.content?.text || '';
        if (section.content?.image) {
          imageMap[section.id] = section.content.image;
        }
      });
      setEditedContent(contentMap);
      setEditedImages(imageMap);
    } catch (error) {
      console.error('Error fetching content:', error);
      setMessage('Error loading content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      const updates = contentSections.map((section) => {
        const content: { text: string; image?: string } = {
          text: editedContent[section.id] || ''
        };

        if (editedImages[section.id]) {
          content.image = editedImages[section.id];
        }

        return {
          id: section.id,
          content,
          updated_at: new Date().toISOString(),
        };
      });

      const { error } = await supabase
        .from('content_sections')
        .upsert(updates);

      if (error) throw error;

      await refreshContent();
      setMessage('Content saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (id: string, value: string) => {
    setEditedContent((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleImageUpload = (id: string, url: string) => {
    setEditedImages((prev) => ({
      ...prev,
      [id]: url,
    }));
  };

  const handleImageRemove = (id: string) => {
    setEditedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[id];
      return newImages;
    });
  };

  const toggleImageUpload = (id: string) => {
    setShowImageUpload((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatSectionKey = (key: string) => {
    return key
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredSections = contentSections.filter(
    (section) => section.page === activeTab
  );

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
          <h1 className="text-3xl font-bold text-primary">Content Management</h1>
          <p className="text-muted mt-2">
            Manage all website text content from one place
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save All Changes
            </>
          )}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('Error')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {pages.map((page) => {
              const Icon = page.icon;
              return (
                <button
                  key={page.id}
                  onClick={() => setActiveTab(page.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === page.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-primary'
                  }`}
                >
                  <Icon size={20} />
                  {page.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-muted">No content sections found for this page</p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <label className="block mb-2">
                    <span className="text-sm font-semibold text-primary">
                      {formatSectionKey(section.section_key)}
                    </span>
                    <span className="text-xs text-muted ml-2">
                      ({section.page}.{section.section_key})
                    </span>
                  </label>
                  {editedContent[section.id]?.length > 100 ? (
                    <textarea
                      value={editedContent[section.id] || ''}
                      onChange={(e) =>
                        handleContentChange(section.id, e.target.value)
                      }
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={editedContent[section.id] || ''}
                      onChange={(e) =>
                        handleContentChange(section.id, e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={section.is_active}
                        onChange={async (e) => {
                          const { error } = await supabase
                            .from('content_sections')
                            .update({ is_active: e.target.checked })
                            .eq('id', section.id);

                          if (!error) {
                            setContentSections((prev) =>
                              prev.map((s) =>
                                s.id === section.id
                                  ? { ...s, is_active: e.target.checked }
                                  : s
                              )
                            );
                            await refreshContent();
                          }
                        }}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-muted">Active</span>
                    </label>
                    <span className="text-xs text-muted">
                      {editedContent[section.id]?.length || 0} characters
                    </span>
                  </div>

                  <div className="mt-4 border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={() => toggleImageUpload(section.id)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-secondary transition-colors font-semibold"
                    >
                      <ImageIcon size={16} />
                      {showImageUpload[section.id] ? 'Hide Image Upload' : 'Add/Edit Image'}
                    </button>

                    {showImageUpload[section.id] && (
                      <div className="mt-3">
                        {editedImages[section.id] && (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-primary mb-2">Current Image:</p>
                            <div className="relative inline-block">
                              <img
                                src={editedImages[section.id]}
                                alt="Content preview"
                                className="max-w-xs max-h-40 rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageRemove(section.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <RefreshCw size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                        <ImageUploader
                          bucket="content-images"
                          onUploadSuccess={(url) => handleImageUpload(section.id, url)}
                          currentImage={editedImages[section.id] || null}
                          label="Upload Image for This Section"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-sand p-6 rounded-lg">
        <h3 className="font-semibold text-primary mb-2">How to use:</h3>
        <ul className="list-disc list-inside space-y-1 text-muted text-sm">
          <li>Select a page tab to view and edit its content</li>
          <li>Make changes to any text field</li>
          <li>Click "Add/Edit Image" to upload images for specific sections</li>
          <li>Images can be uploaded by selecting a file or dragging and dropping</li>
          <li>Click Save All Changes to update the website</li>
          <li>Changes will appear immediately on the live website</li>
          <li>Uncheck Active to temporarily hide content without deleting it</li>
        </ul>
      </div>
    </div>
  );
}
