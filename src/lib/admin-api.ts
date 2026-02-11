import { supabase } from './supabase';

export async function adminDeleteRecord(table: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          action: 'delete_record',
          table,
          record_id: id,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error || 'Delete failed');
    }

    return { success: true };
  } catch (err: any) {
    console.error(`Admin delete failed for ${table}/${id}:`, err);
    return { success: false, error: err.message };
  }
}
