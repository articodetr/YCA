import { useState, useEffect } from 'react';
import { Save, RefreshCw, FileText, Home, Mail, Info, Users, Calendar, Newspaper, BookOpen, Briefcase, Heart, HandHeart, FolderOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useContent } from '../../contexts/ContentContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import HomePageEditor from '../../components/admin/content-editors/HomePageEditor';
import GenericPageEditor from '../../components/admin/content-editors/GenericPageEditor';
import { ContentSection, PageImage } from '../../components/admin/content-editors/types';
import { getPageDefaults, hasDefaults } from '../../data/contentDefaults';

export default function ContentManagement() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [editedContentEn, setEditedContentEn] = useState<Record<string, string>>({});
  const [editedContentAr, setEditedContentAr] = useState<Record<string, string>>({});
  const [editedImages, setEditedImages] = useState<Record<string, string>>({});
  const { refreshContent } = useContent();
  const { refreshSettings } = useSiteSettings();

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
      const [contentRes, imagesRes] = await Promise.all([
        supabase
          .from('content_sections')
          .select('*')
          .order('page', { ascending: true })
          .order('section_key', { ascending: true }),
        supabase
          .from('page_images')
          .select('*')
          .order('page_key')
          .order('image_key'),
      ]);

      if (contentRes.error) throw contentRes.error;

      let sections = contentRes.data || [];

      const allPages = ['home', 'services', 'contact', 'footer', 'about_mission', 'about_history', 'about_team', 'about_partners', 'about_reports', 'donate', 'volunteer', 'membership', 'jobs', 'partnerships', 'events', 'news', 'resources', 'programmes'];
      const seededPages = new Set(sections.map((s: ContentSection) => s.page));
      const missingPages = allPages.filter(p => !seededPages.has(p) && hasDefaults(p));

      if (missingPages.length > 0) {
        const rows = missingPages.flatMap(page =>
          getPageDefaults(page).map(d => ({
            page,
            section_key: d.section_key,
            content: { text_en: d.text_en, text_ar: d.text_ar, text: d.text_en },
            is_active: true,
          }))
        );
        const { data: inserted } = await supabase.from('content_sections').upsert(rows, { onConflict: 'page,section_key' }).select('*');
        if (inserted) {
          sections = [...sections, ...inserted];
        }
      }

      setContentSections(sections);
      setPageImages(imagesRes.data || []);

      const enMap: Record<string, string> = {};
      const arMap: Record<string, string> = {};
      const imageMap: Record<string, string> = {};
      contentRes.data?.forEach((section) => {
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
            page: section.page,
            section_key: section.section_key,
            content,
            updated_at: new Date().toISOString(),
          };
        });

      const { error } = await supabase.from('content_sections').upsert(updates);
      if (error) throw error;

      await Promise.all([refreshContent(), refreshSettings()]);
      setMessage('Content saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const handleContentEnChange = (id: string, value: string) => {
    setEditedContentEn((prev) => ({ ...prev, [id]: value }));
  };

  const handleContentArChange = (id: string, value: string) => {
    setEditedContentAr((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (id: string, url: string) => {
    setEditedImages((prev) => ({ ...prev, [id]: url }));
  };

  const handleImageRemove = (id: string) => {
    setEditedImages((prev) => {
      const newImages = { ...prev };
      delete newImages[id];
      return newImages;
    });
  };

  const handlePageImageChange = async (id: string, url: string) => {
    const { error } = await supabase
      .from('page_images')
      .update({ image_url: url, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setPageImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, image_url: url } : img))
      );
      await refreshSettings();
    }
  };

  const handleToggleActive = async (section: ContentSection, checked: boolean) => {
    const { error } = await supabase
      .from('content_sections')
      .update({ is_active: checked })
      .eq('id', section.id);

    if (!error) {
      setContentSections((prev) =>
        prev.map((s) => (s.id === section.id ? { ...s, is_active: checked } : s))
      );
      await refreshContent();
    }
  };

  const filteredSections = contentSections.filter((s) => s.page === activeTab);
  const filteredPageImages = pageImages.filter((i) => i.page_key === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const editorProps = {
    sections: filteredSections,
    editedContentEn,
    editedContentAr,
    editedImages,
    onContentEnChange: handleContentEnChange,
    onContentArChange: handleContentArChange,
    onImageChange: handleImageChange,
    onImageRemove: handleImageRemove,
    pageImages: filteredPageImages,
    onPageImageChange: handlePageImageChange,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Content Management</h1>
          <p className="text-muted mt-2">Manage website content with live preview</p>
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

        <div className="flex-1">
          {activeTab === 'home' ? (
            <HomePageEditor {...editorProps} />
          ) : (
            <GenericPageEditor
              {...editorProps}
              onToggleActive={handleToggleActive}
            />
          )}
        </div>
      </div>
    </div>
  );
}
