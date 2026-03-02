export type CoreProgramme = {
  slug: string;
  title_en: string;
  title_ar: string;
};

// Fixed Programme tabs (as requested). These tabs are shown even if the related
// programme record is missing or inactive (a fallback message will be shown).
export const CORE_PROGRAMMES: CoreProgramme[] = [
  { slug: 'women-children', title_en: "Women and Children’s Programme", title_ar: 'برنامج النساء والأطفال' },
  { slug: 'elderly', title_en: "Elderly's Programme", title_ar: 'برنامج كبار السن' },
  { slug: 'youth', title_en: 'Youth Programme', title_ar: 'برنامج الشباب' },
  { slug: 'children', title_en: "Children's Programme", title_ar: 'برنامج الأطفال' },
  { slug: 'education', title_en: 'Education Programme', title_ar: 'برنامج التعليم' },
  { slug: 'men', title_en: "Men's Programme", title_ar: 'برنامج الرجال' },
  { slug: 'activities-sports', title_en: 'Activities and Sports Programme', title_ar: 'برنامج الأنشطة والرياضة' },
  { slug: 'journey-within', title_en: 'The Journey Within', title_ar: 'الرحلة إلى الداخل' },
];

export function isCoreProgrammeSlug(slug: string): boolean {
  return CORE_PROGRAMMES.some((p) => p.slug === slug);
}
