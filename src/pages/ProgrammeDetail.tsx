import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CORE_PROGRAMMES, isCoreProgrammeSlug } from '../lib/coreProgrammes';

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

/**
 * This route is kept for backward compatibility (old links/shared URLs).
 * The new design is a single Programmes page with fixed tabs and no navigation.
 */
export default function ProgrammeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const go = async () => {
      const key = (id || '').trim();
      if (!key) {
        navigate('/programmes', { replace: true });
        return;
      }

      // If the URL already has a core slug, redirect directly.
      if (isCoreProgrammeSlug(key)) {
        navigate(`/programmes?tab=${encodeURIComponent(key)}`, { replace: true });
        return;
      }

      // If UUID: fetch programme slug then redirect.
      if (isUuid(key)) {
        try {
          const { data } = await supabase
            .from('programmes_items')
            .select('slug')
            .eq('id', key)
            .maybeSingle();

          const slug = (data?.slug || '').trim();
          if (slug && isCoreProgrammeSlug(slug)) {
            navigate(`/programmes?tab=${encodeURIComponent(slug)}`, { replace: true });
            return;
          }
        } catch (e) {
          console.warn('Programme redirect fetch failed:', e);
        }
      }

      // Unknown/legacy: fallback to first tab.
      navigate(`/programmes?tab=${encodeURIComponent(CORE_PROGRAMMES[0].slug)}`, { replace: true });
    };

    void go();
  }, [id, navigate]);

  return (
    <div className="pt-24 min-h-[50vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={44} />
    </div>
  );
}
