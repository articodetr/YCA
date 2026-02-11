import { supabase } from './supabase';

export async function adminDeleteRecord(table: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    let edgeFnSucceeded = false;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: 'delete', table, id }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.ok && (result.success || result.deleted)) {
        edgeFnSucceeded = true;
      }
    } catch {
      // edge function unreachable
    }

    if (edgeFnSucceeded) {
      const { data: stillExists } = await supabase
        .from(table)
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (!stillExists) return { success: true };
    }

    const { data: deleted, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
      .select('id');

    if (error) throw new Error(error.message);
    if (deleted && deleted.length > 0) return { success: true };

    const { data: checkRecord } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (!checkRecord) return { success: true };

    throw new Error('Could not delete record. Please try again.');
  } catch (err: any) {
    console.error(`Admin delete failed for ${table}/${id}:`, err);
    return { success: false, error: err.message };
  }
}
