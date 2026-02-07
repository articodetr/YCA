import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface SiteSettings {
  [key: string]: string;
}

interface PageImage {
  id: string;
  page_key: string;
  image_key: string;
  image_url: string;
  alt_text: string;
  alt_text_ar: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  getSetting: (key: string, fallback?: string) => string;
  getPageImage: (pageKey: string, imageKey: string, fallback?: string) => string;
  getPageImageAlt: (pageKey: string, imageKey: string, fallback?: string) => string;
  refreshSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [settingsRes, imagesRes] = await Promise.all([
        supabase.from('site_settings').select('key, value'),
        supabase.from('page_images').select('*').eq('is_active', true),
      ]);

      if (settingsRes.data) {
        const map: SiteSettings = {};
        settingsRes.data.forEach((s) => {
          const val = s.value;
          map[s.key] = typeof val === 'string' ? val.replace(/^"|"$/g, '') : String(val);
        });
        setSettings(map);
        localStorage.setItem('yca_site_settings', JSON.stringify(map));
      }

      if (imagesRes.data) {
        setPageImages(imagesRes.data);
        localStorage.setItem('yca_page_images', JSON.stringify(imagesRes.data));
      }

      localStorage.setItem('yca_settings_ts', Date.now().toString());
    } catch (err) {
      console.error('Error fetching site settings:', err);
      const cached = localStorage.getItem('yca_site_settings');
      const cachedImages = localStorage.getItem('yca_page_images');
      if (cached) setSettings(JSON.parse(cached));
      if (cachedImages) setPageImages(JSON.parse(cachedImages));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('yca_site_settings');
    const cachedImages = localStorage.getItem('yca_page_images');
    const ts = localStorage.getItem('yca_settings_ts');
    const age = ts ? Date.now() - parseInt(ts) : Infinity;

    if (cached && age < 5 * 60 * 1000) {
      setSettings(JSON.parse(cached));
      if (cachedImages) setPageImages(JSON.parse(cachedImages));
      setLoading(false);
    }

    fetchAll();
  }, []);

  const getSetting = (key: string, fallback: string = '') => {
    return settings[key] || fallback;
  };

  const getPageImage = (pageKey: string, imageKey: string, fallback: string = '/image.png') => {
    const img = pageImages.find((i) => i.page_key === pageKey && i.image_key === imageKey);
    return img?.image_url || fallback;
  };

  const getPageImageAlt = (pageKey: string, imageKey: string, fallback: string = '') => {
    const img = pageImages.find((i) => i.page_key === pageKey && i.image_key === imageKey);
    return img?.alt_text || fallback;
  };

  const refreshSettings = async () => {
    await fetchAll();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, getSetting, getPageImage, getPageImageAlt, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
