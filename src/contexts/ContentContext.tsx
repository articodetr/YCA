import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';

interface BilingualText {
  en: string;
  ar: string;
}

interface ContentData {
  [key: string]: BilingualText;
}

interface ImageData {
  [key: string]: string;
}

interface ContentContextType {
  content: ContentData;
  images: ImageData;
  loading: boolean;
  error: string | null;
  getContent: (page: string, key: string, fallback?: string) => string;
  getImage: (page: string, key: string, fallback?: string) => string;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<ContentData>({});
  const [images, setImages] = useState<ImageData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const languageContext = useLanguage();

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('content_sections')
        .select('page, section_key, content, title_ar')
        .eq('is_active', true);

      if (fetchError) throw fetchError;

      const contentMap: ContentData = {};
      const imageMap: ImageData = {};
      data?.forEach((item) => {
        const key = `${item.page}.${item.section_key}`;
        const contentObj = item.content as { text_en?: string; text_ar?: string; text?: string; image?: string };

        // Use nullish coalescing so empty strings remain valid values.
        // This allows admins to intentionally clear content (set it to "") without the UI
        // falling back to defaults.
        const textEn = (contentObj?.text_en ?? contentObj?.text ?? '') as string;
        const textAr = (contentObj?.text_ar ?? '') as string;

        contentMap[key] = { en: textEn, ar: textAr };

        if (contentObj?.image) {
          imageMap[key] = contentObj.image;
        }
      });

      setContent(contentMap);
      setImages(imageMap);

      localStorage.setItem('yca_content', JSON.stringify(contentMap));
      localStorage.setItem('yca_images', JSON.stringify(imageMap));
      localStorage.setItem('yca_content_timestamp', Date.now().toString());
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Failed to load content');

      const cachedContent = localStorage.getItem('yca_content');
      const cachedImages = localStorage.getItem('yca_images');
      if (cachedContent) {
        setContent(JSON.parse(cachedContent));
      }
      if (cachedImages) {
        setImages(JSON.parse(cachedImages));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedContent = localStorage.getItem('yca_content');
    const cachedImages = localStorage.getItem('yca_images');
    const timestamp = localStorage.getItem('yca_content_timestamp');
    const cacheAge = timestamp ? Date.now() - parseInt(timestamp) : Infinity;
    const cacheMaxAge = 5 * 60 * 1000;

    if (cachedContent && cacheAge < cacheMaxAge) {
      setContent(JSON.parse(cachedContent));
      if (cachedImages) {
        setImages(JSON.parse(cachedImages));
      }
      setLoading(false);
    }

    fetchContent();
  }, []);

  const getContent = (page: string, key: string, fallback: string = '') => {
    const fullKey = `${page}.${key}`;
    const bilingualContent = content[fullKey];

    if (!bilingualContent) return fallback;

    const currentLang = languageContext.language;
    const text = bilingualContent[currentLang];

    // IMPORTANT: Do not treat empty string as "missing".
    // If admin intentionally cleared the text (""), we should return "".
    if (text !== undefined && text !== null) return text;
    if (bilingualContent.en !== undefined && bilingualContent.en !== null) return bilingualContent.en;
    return fallback;
  };

  const getImage = (page: string, key: string, fallback: string = '') => {
    const fullKey = `${page}.${key}`;
    return images[fullKey] || fallback;
  };

  const refreshContent = async () => {
    await fetchContent();
  };

  return (
    <ContentContext.Provider value={{ content, images, loading, error, getContent, getImage, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}
