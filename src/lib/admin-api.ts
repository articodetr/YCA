import { supabase } from './supabase';

export async function adminDeleteRecord(table: string, id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    const endpoints = ['admin-operations', 'manage-admin'];

    for (const endpoint of endpoints) {
      try {
        const body = endpoint === 'admin-operations'
          ? { action: 'delete', table, id }
          : { action: 'delete_record', table, record_id: id };

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify(body),
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success || result.deleted) return { success: true };
        }
      } catch {
        continue;
      }
    }

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    console.error(`Admin delete failed for ${table}/${id}:`, err);
    return { success: false, error: err.message };
  }
}
