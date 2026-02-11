import { supabase } from './supabase';

const SOFT_DELETE_TABLES = [
  'wakala_applications',
  'membership_applications',
  'event_registrations',
  'volunteer_applications',
  'partnership_inquiries',
  'complaints',
  'feedback',
  'legal_requests',
  'donations',
  'business_supporters',
  'contact_submissions',
  'newsletter_subscribers',
];

async function releaseWakalaSlot(id: string) {
  const { data: app } = await supabase
    .from('wakala_applications')
    .select('slot_id')
    .eq('id', id)
    .maybeSingle();

  if (app?.slot_id) {
    await supabase
      .from('booking_slots')
      .update({ is_available: true })
      .eq('id', app.slot_id);
  }
}

export async function adminDeleteRecord(
  table: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    if (table === 'wakala_applications') {
      await releaseWakalaSlot(id);
    }

    if (SOFT_DELETE_TABLES.includes(table)) {
      const { error } = await supabase
        .from(table)
        .update({ status: 'deleted_by_admin' })
        .eq('id', id);

      if (error) throw new Error(error.message);
      return { success: true };
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    console.error(`Admin delete failed for ${table}/${id}:`, err);
    return { success: false, error: err.message };
  }
}

export async function adminBulkDelete(
  table: string,
  ids: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    if (SOFT_DELETE_TABLES.includes(table)) {
      const { error } = await supabase
        .from(table)
        .update({ status: 'deleted_by_admin' })
        .in('id', ids);

      if (error) throw new Error(error.message);
      return { success: true };
    }

    const { error } = await supabase
      .from(table)
      .delete()
      .in('id', ids);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (err: any) {
    console.error(`Admin bulk delete failed for ${table}:`, err);
    return { success: false, error: err.message };
  }
}
