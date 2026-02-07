export interface ContentSection {
  id: string;
  page: string;
  section_key: string;
  content: { text?: string; text_en?: string; text_ar?: string; image?: string };
  is_active: boolean;
}

export interface PageImage {
  id: string;
  page_key: string;
  image_key: string;
  image_url: string;
  alt_text: string;
  alt_text_ar: string;
  is_active: boolean;
}

export interface SectionEditorProps {
  sections: ContentSection[];
  editedContentEn: Record<string, string>;
  editedContentAr: Record<string, string>;
  editedImages: Record<string, string>;
  onContentEnChange: (id: string, value: string) => void;
  onContentArChange: (id: string, value: string) => void;
  onImageChange: (id: string, url: string) => void;
  onImageRemove: (id: string) => void;
  pageImages?: PageImage[];
  onPageImageChange?: (id: string, url: string) => void;
}

export function useSectionHelper(
  sections: ContentSection[],
  editedContentEn: Record<string, string>,
  editedContentAr: Record<string, string>
) {
  const getSection = (key: string) => sections.find((s) => s.section_key === key);
  const getId = (key: string) => getSection(key)?.id || '';
  const getEn = (key: string) => {
    const s = getSection(key);
    return s ? editedContentEn[s.id] || '' : '';
  };
  const getAr = (key: string) => {
    const s = getSection(key);
    return s ? editedContentAr[s.id] || '' : '';
  };
  return { getSection, getId, getEn, getAr };
}
