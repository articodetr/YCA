import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

import { supabase } from '../lib/supabase';
import { CORE_PROGRAMME_SLUGS } from '../lib/coreProgrammes';
import { useLanguage } from '../contexts/LanguageContext';

// This route exists only for backward compatibility with older links like:
//   /programmes/women
//   /programmes/<uuid>
// We now keep Programmes as a single page and redirect to:
//   /programmes?tab=<slug>

const SLUG_ALIASES: Record<string, string> = {
  women: 'women',
  'women-children': 'women-children',
  women_children: 'women-children',
  elderly: 'elderly',
  youth: 'youth',
  children: 'children',
  education: 'education',
  men: 'men',
  'activities-sports': 'activities-sports',
  activities_sports: 'activities-sports',
  journey: 'journey-within',
  'journey-within': 'journey-within',
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function normalizeToCoreSlug(raw?: string | null) {
  const key = (raw || '').trim();
  if (!key) return null;
  if (CORE_PROGRAMME_SLUGS.includes(key)) return key;
  const mapped = SLUG_ALIASES[key];
  if (mapped && CORE_PROGRAMME_SLUGS.includes(mapped)) return mapped;
  return null;
}

export default function ProgrammeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [message, setMessage] = useState<string>(isRTL ? '...جار تحويلك إلى صفحة البرامج' : 'Redirecting to Programmes…');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const key = (id || '').trim();
      if (!key) {
        navigate('/programmes', { replace: true });
        return;
      }

      // 1) If it's already a known slug / alias, redirect immediately.
      const direct = normalizeToCoreSlug(key);
      if (direct) {
        navigate(`/programmes?tab=${encodeURIComponent(direct)}`, { replace: true });
        return;
      }

      // 2) Otherwise, try to resolve from the DB (uuid / slug / category).
      try {
        setMessage(isRTL ? '...جار البحث عن البرنامج' : 'Looking up programme…');

        // Try by ID (uuid)
        if (isUuid(key)) {
          const { data } = await supabase
            .from('programmes_items')
            .select('slug,category')
            .eq('id', key)
            .maybeSingle();

          if (cancelled) return;

          const slug = normalizeToCoreSlug(data?.slug) || normalizeToCoreSlug(data?.category);
          navigate(slug ? `/programmes?tab=${encodeURIComponent(slug)}` : '/programmes', { replace: true });
          return;
        }

        // Try by slug
        const { data: bySlug } = await supabase
          .from('programmes_items')
          .select('slug,category')
          .eq('slug', key)
          .maybeSingle();

        if (cancelled) return;

        if (bySlug) {
          const slug = normalizeToCoreSlug(bySlug.slug) || normalizeToCoreSlug(bySlug.category);
          navigate(slug ? `/programmes?tab=${encodeURIComponent(slug)}` : '/programmes', { replace: true });
          return;
        }

        // Try by category
        const { data: byCategory } = await supabase
          .from('programmes_items')
          .select('slug,category')
          .eq('category', key)
          .order('order_number', { ascending: true })
          .limit(1);

        if (cancelled) return;

        const row = Array.isArray(byCategory) && byCategory.length > 0 ? byCategory[0] : null;
        const slug = normalizeToCoreSlug(row?.slug) || normalizeToCoreSlug(row?.category);
        navigate(slug ? `/programmes?tab=${encodeURIComponent(slug)}` : '/programmes', { replace: true });
      } catch {
        if (!cancelled) navigate('/programmes', { replace: true });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id, isRTL, navigate]);

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-sand" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col items-center justify-center">
        <Loader2 size={52} className="text-primary animate-spin mb-4" />
        <p className="text-lg text-muted">{message}</p>
      </div>
    </div>
  );
}
