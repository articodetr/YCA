import { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Home, Mail, Info, DollarSign, Image as ImageIcon, Users, Calendar, Newspaper, BookOpen, Briefcase, Heart, HandHeart, FolderOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';
import ImageUploader from '../../components/admin/ImageUploader';

interface ContentSection {
  id: string;
  page: string;
  section_key: string;
  content: { text?: string; text_en?: string; text_ar?: string; image?: string };
  is_active: boolean;
}

export default function ContentManagement() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [editedContentEn, setEditedContentEn] = useState<Record<string, string>>({});
  const [editedContentAr, setEditedContentAr] = useState<Record<string, string>>({});
  const [editedImages, setEditedImages] = useState<Record<string, string>>({});
  const [showImageUpload, setShowImageUpload] = useState<Record<string, boolean>>({});
  const { refreshContent } = useContent();

  const pageGroups = [
    {
      label: 'Main',
      pages: [
        { id: 'home', name: 'Home', icon: Home },
        { id: 'services', name: 'Services', icon: FileText },
        { id: 'contact', name: 'Contact', icon: Mail },
        { id: 'footer', name: 'Footer', icon: Info },
      ],
    },
    {
      label: 'About',
      pages: [
        { id: 'about_mission', name: 'Mission', icon: Info },
        { id: 'about_history', name: 'History', icon: BookOpen },
        { id: 'about_team', name: 'Team', icon: Users },
        { id: 'about_partners', name: 'Partners', icon: Briefcase },
        { id: 'about_reports', name: 'Reports', icon: FolderOpen },
      ],
    },
    {
      label: 'Get Involved',
      pages: [
        { id: 'donate', name: 'Donate', icon: Heart },
        { id: 'volunteer', name: 'Volunteer', icon: HandHeart },
        { id: 'membership', name: 'Membership', icon: Users },
        { id: 'jobs', name: 'Jobs', icon: Briefcase },
        { id: 'partnerships', name: 'Partnerships', icon: Briefcase },
      ],
    },
    {
      label: 'Other',
      pages: [
        { id: 'events', name: 'Events', icon: Calendar },
        { id: 'news', name: 'News', icon: Newspaper },
        { id: 'resources', name: 'Resources', icon: FolderOpen },
        { id: 'programmes', name: 'Programmes', icon: BookOpen },
      ],
    },
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

      const enMap: Record<string, string> = {};
      const arMap: Record<string, string> = {};
      const imageMap: Record<string, string> = {};
      data?.forEach((section) => {
        const c = section.content;
        enMap[section.id] = c?.text_en || c?.text || '';
        arMap[section.id] = c?.text_ar || '';
        if (c?.image) {
          imageMap[section.id] = c.image;
        }
      });
      setEditedContentEn(enMap);
      setEditedContentAr(arMap);
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

      const updates = contentSections
        .filter((s) => s.page === activeTab)
        .map((section) => {
          const content: Record<string, string> = {
            text_en: editedContentEn[section.id] || '',
            text_ar: editedContentAr[section.id] || '',
            text: editedContentEn[section.id] || '',
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

  const handleImageUpload = (id: string, url: string) => {
    setEditedImages((prev) => ({ ...prev, [id]: url }));
  };

  const handleImageRemove = (id: string) => {
    setEditedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[id];
      return newImages;
    });
  };

  const toggleImageUpload = (id: string) => {
    setShowImageUpload((prev) => ({ ...prev, [id]: !prev[id] }));
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
          <p className="text-muted mt-2">Manage all website text content (English & Arabic)</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {saving ? (
            <><RefreshCw className="animate-spin" size={20} /> Saving...</>
          ) : (
            <><Save size={20} /> Save Changes</>
          )}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0 space-y-4">
          {pageGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{group.label}</p>
              <nav className="space-y-0.5">
                {group.pages.map((page) => {
                  const Icon = page.icon;
                  const count = contentSections.filter((s) => s.page === page.id).length;
                  return (
                    <button
                      key={page.id}
                      onClick={() => setActiveTab(page.id)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeTab === page.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon size={16} />
                        {page.name}
                      </span>
                      {count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          activeTab === page.id ? 'bg-white/20' : 'bg-gray-100'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-muted">No content sections found for this page</p>
                <p className="text-sm text-gray-400 mt-2">Content sections are added automatically when new content entries are created in the database</p>
              </div>
            ) : (
              filteredSections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <label className="block">
                      <span className="text-sm font-semibold text-primary">
                        {formatSectionKey(section.section_key)}
                      </span>
                      <span className="text-xs text-muted ml-2">
                        ({section.page}.{section.section_key})
                      </span>
                    </label>
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
                                s.id === section.id ? { ...s, is_active: e.target.checked } : s
                              )
                            );
                            await refreshContent();
                          }
                        }}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="text-muted">Active</span>
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">English</label>
                      {(editedContentEn[section.id]?.length || 0) > 100 ? (
                        <textarea
                          value={editedContentEn[section.id] || ''}
                          onChange={(e) => setEditedContentEn((prev) => ({ ...prev, [section.id]: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editedContentEn[section.id] || ''}
                          onChange={(e) => setEditedContentEn((prev) => ({ ...prev, [section.id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Arabic</label>
                      {(editedContentAr[section.id]?.length || 0) > 100 ? (
                        <textarea
                          dir="rtl"
                          value={editedContentAr[section.id] || ''}
                          onChange={(e) => setEditedContentAr((prev) => ({ ...prev, [section.id]: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                        />
                      ) : (
                        <input
                          type="text"
                          dir="rtl"
                          value={editedContentAr[section.id] || ''}
                          onChange={(e) => setEditedContentAr((prev) => ({ ...prev, [section.id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleImageUpload(section.id)}
                      className="flex items-center gap-2 text-xs text-primary hover:text-secondary transition-colors font-semibold"
                    >
                      <ImageIcon size={14} />
                      {showImageUpload[section.id] ? 'Hide Image' : 'Image'}
                    </button>

                    {showImageUpload[section.id] && (
                      <div className="mt-3">
                        {editedImages[section.id] && (
                          <div className="mb-3">
                            <div className="relative inline-block">
                              <img
                                src={editedImages[section.id]}
                                alt="Content preview"
                                className="max-w-xs max-h-32 rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageRemove(section.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                        <ImageUploader
                          bucket="content-images"
                          onUploadSuccess={(url) => handleImageUpload(section.id, url)}
                          currentImage={editedImages[section.id] || null}
                          label="Upload Image"
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
    </div>
  );
}
