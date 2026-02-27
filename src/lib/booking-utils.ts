import { supabase } from './supabase';

export interface WorkingHoursConfig {
  id: string;
  day_of_week: number;
  day_name_en: string;
  day_name_ar: string;
  start_time: string;
  end_time: string;
  last_appointment_time: string;
  slot_interval_minutes: number;
  is_active: boolean;
}

export interface TimeSlot {
  id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_blocked_by_admin: boolean;
}

export interface BookingData {
  slot_id: string;
  service_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: 30 | 60;
}

export interface EffectiveWorkingHours {
  start_time: string;
  end_time: string;
  break_times: { start: string; end: string }[];
  is_active: boolean;
}

export async function getEffectiveWorkingHours(date: string): Promise<EffectiveWorkingHours | null> {
  const { data: specific } = await supabase
    .from('day_specific_hours')
    .select('start_time, end_time, break_times, is_holiday')
    .eq('date', date)
    .maybeSingle();

  if (specific) {
    return {
      start_time: specific.start_time,
      end_time: specific.end_time,
      break_times: specific.break_times || [],
      is_active: !specific.is_holiday,
    };
  }

  const d = new Date(date);
  const dow = d.getDay() === 0 ? 7 : d.getDay();

  const { data: config } = await supabase
    .from('working_hours_config')
    .select('start_time, end_time, is_active')
    .eq('day_of_week', dow)
    .maybeSingle();

  if (config) {
    return {
      start_time: config.start_time,
      end_time: config.end_time,
      break_times: [],
      is_active: config.is_active,
    };
  }

  return null;
}

export async function getWorkingHoursConfig(): Promise<WorkingHoursConfig[]> {
  const { data, error } = await supabase
    .from('working_hours_config')
    .select('*')
    .order('day_of_week');

  if (error) {
    console.error('Error fetching working hours:', error);
    return [];
  }

  return data || [];
}

export async function updateWorkingHours(
  dayOfWeek: number,
  updates: Partial<WorkingHoursConfig>
): Promise<boolean> {
  const { error } = await supabase
    .from('working_hours_config')
    .update(updates)
    .eq('day_of_week', dayOfWeek);

  if (error) {
    console.error('Error updating working hours:', error);
    return false;
  }

  return true;
}

export async function generateSlotsForDateRange(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('generate_availability_slots_auto', {
      p_service_id: serviceId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error generating slots:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error calling generate function:', error);
    return 0;
  }
}

export async function getAvailableSlotsForDate(
  serviceId: string,
  date: string
): Promise<TimeSlot[]> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('service_id', serviceId)
    .eq('date', date)
    .eq('is_blocked_by_admin', false)
    .order('start_time');

  if (error) {
    console.error('Error fetching slots:', error);
    return [];
  }

  const rows = (data || []).filter(slot => !isSlotInPast(date, slot.start_time));
  return rows;
}

export async function getAvailableSlotsForDuration(
  serviceId: string,
  date: string,
  durationMinutes: 30 | 60
): Promise<TimeSlot[]> {
  const allSlots = await getAvailableSlotsForDate(serviceId, date);

  if (durationMinutes === 30) {
    return allSlots.filter(slot => slot.is_available);
  }

  const availableSlots: TimeSlot[] = [];

  for (let i = 0; i < allSlots.length - 1; i++) {
    const currentSlot = allSlots[i];
    const nextSlot = allSlots[i + 1];

    if (
      currentSlot.is_available &&
      nextSlot.is_available &&
      currentSlot.end_time === nextSlot.start_time
    ) {
      availableSlots.push({
        ...currentSlot,
        end_time: nextSlot.end_time,
      });
    }
  }

  return availableSlots;
}

export async function checkSlotStillAvailable(slotId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('availability_slots')
    .select('is_available')
    .eq('id', slotId)
    .maybeSingle();

  if (error || !data) return false;
  return data.is_available === true;
}

export async function findNearestAvailableSlot(
  serviceId: string,
  date: string,
  targetTime: string,
  durationMinutes: 30 | 60
): Promise<TimeSlot | null> {
  const slots = await getAvailableSlotsForDuration(serviceId, date, durationMinutes);
  if (slots.length === 0) return null;

  const targetMinutes = timeToMinutes(targetTime);
  let nearest: TimeSlot | null = null;
  let minDiff = Infinity;

  for (const slot of slots) {
    const diff = Math.abs(timeToMinutes(slot.start_time) - targetMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = slot;
    }
  }

  return nearest;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export async function reserveSlots(
  bookingData: BookingData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { slot_id, service_id, duration_minutes, booking_date } = bookingData;

    if (duration_minutes === 30) {
      const { data, error } = await supabase.rpc('reserve_availability_slot', {
        p_slot_id: slot_id,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Slot is no longer available' };
      }
    } else {
      const allSlots = await getAvailableSlotsForDate(service_id, booking_date);
      const currentSlotIndex = allSlots.findIndex(s => s.id === slot_id);

      if (currentSlotIndex === -1 || currentSlotIndex >= allSlots.length - 1) {
        return { success: false, error: 'Invalid slot selection' };
      }

      const nextSlot = allSlots[currentSlotIndex + 1];

      const { data, error } = await supabase.rpc('reserve_two_consecutive_slots', {
        p_slot_id_1: slot_id,
        p_slot_id_2: nextSlot.id,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.success) {
        return { success: false, error: data.error || 'Slots are no longer available' };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error reserving slots:', error);
    return { success: false, error: 'Failed to reserve slots' };
  }
}

export async function releaseSlots(
  slotId: string,
  serviceId: string,
  durationMinutes: 30 | 60,
  bookingDate: string,
  startTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (durationMinutes === 30) {
      const { data, error } = await supabase.rpc('release_availability_slot', {
        p_slot_id: slotId,
      });

      if (error) return { success: false, error: error.message };
      if (!data?.success) return { success: false, error: data?.error || 'Failed to release slot' };
    } else {
      const allSlots = await getAvailableSlotsForDate(serviceId, bookingDate);
      const currentSlotIndex = allSlots.findIndex(s => s.id === slotId);

      if (currentSlotIndex === -1 || currentSlotIndex >= allSlots.length - 1) {
        return { success: false, error: 'Invalid slot' };
      }

      const nextSlot = allSlots[currentSlotIndex + 1];

      const rel1 = await supabase.rpc('release_availability_slot', { p_slot_id: slotId });
      if (rel1.error) return { success: false, error: rel1.error.message };
      if (!rel1.data?.success) return { success: false, error: rel1.data?.error || 'Failed to release first slot' };

      const rel2 = await supabase.rpc('release_availability_slot', { p_slot_id: nextSlot.id });
      if (rel2.error) return { success: false, error: rel2.error.message };
      if (!rel2.data?.success) return { success: false, error: rel2.data?.error || 'Failed to release second slot' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error releasing slots:', error);
    return { success: false, error: 'Failed to release slots' };
  }
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`;
}

export function isSlotInPast(date: string, startTime: string): boolean {
  // Treat `date` + `startTime` as local time. `startTime` comes from Postgres `time`.
  const parts = String(startTime).split(':');
  const h = Number(parts[0] || 0);
  const m = Number(parts[1] || 0);
  const s = Number(parts[2] || 0);

  // IMPORTANT: new Date('YYYY-MM-DD') is parsed as UTC in browsers.
  // Build a local datetime explicitly to avoid off-by-one issues.
  const [yy, mm, dd] = date.split('-').map(n => Number(n));
  const slotDateTime = new Date(yy, (mm || 1) - 1, dd || 1, h, m, s, 0);

  return slotDateTime.getTime() <= Date.now();
}

export function getDayOfWeek(date: string): number {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

export async function getUserBookings(memberId: string) {
  const { data, error } = await supabase
    .from('wakala_applications')
    .select('*')
    .eq('member_id', memberId)
    .not('booking_date', 'is', null)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }

  return data || [];
}

export async function cancelBooking(
  applicationId: string,
  slotId: string,
  serviceId: string,
  durationMinutes: 30 | 60,
  bookingDate: string,
  startTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const releaseResult = await releaseSlots(
      slotId,
      serviceId,
      durationMinutes,
      bookingDate,
      startTime
    );

    if (!releaseResult.success) {
      return releaseResult;
    }

    const { error } = await supabase
      .from('wakala_applications')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by_user: true,
      })
      .eq('id', applicationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, error: 'Failed to cancel booking' };
  }
}

// Availability Management Functions

export interface AvailabilityStats {
  date: string;
  day_name_en: string;
  day_name_ar: string;
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  blocked_slots: number;
  is_blocked: boolean;
  blocked_reason_en: string | null;
  blocked_reason_ar: string | null;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason_en: string;
  reason_ar: string;
  created_at: string;
  created_by: string;
}

export interface RegenerateResult {
  slots_created: number;
  slots_preserved: number;
}

export interface BulkRegenerateResult {
  total_slots_created: number;
  total_slots_preserved: number;
  dates_processed: number;
}

export async function getAvailabilityStats(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<AvailabilityStats[]> {
  try {
    const { data, error } = await supabase.rpc('get_availability_stats', {
      p_service_id: serviceId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching availability stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error calling stats function:', error);
    return [];
  }
}

export async function regenerateSlotsForDate(
  serviceId: string,
  date: string
): Promise<RegenerateResult | null> {
  try {
    const { data, error } = await supabase.rpc('regenerate_slots_for_date', {
      p_service_id: serviceId,
      p_date: date,
    });

    if (error) {
      console.error('Error regenerating slots:', error);
      return null;
    }

    return data?.[0] || { slots_created: 0, slots_preserved: 0 };
  } catch (error) {
    console.error('Error calling regenerate function:', error);
    return null;
  }
}

export async function regenerateSlotsBulk(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<BulkRegenerateResult | null> {
  try {
    const { data, error } = await supabase.rpc('regenerate_slots_bulk', {
      p_service_id: serviceId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error bulk regenerating slots:', error);
      return null;
    }

    return data?.[0] || { total_slots_created: 0, total_slots_preserved: 0, dates_processed: 0 };
  } catch (error) {
    console.error('Error calling bulk regenerate function:', error);
    return null;
  }
}

export async function getUnavailableDates(
  startDate: string,
  endDate: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_unavailable_dates', {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching unavailable dates:', error);
      return [];
    }

    return (data || []).map((row: { unavailable_date: string }) => row.unavailable_date);
  } catch (error) {
    console.error('Error calling unavailable dates function:', error);
    return [];
  }
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('date');

  if (error) {
    console.error('Error fetching blocked dates:', error);
    return [];
  }

  return data || [];
}

export async function addBlockedDate(
  date: string,
  reasonEn: string,
  reasonAr: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user.user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('blocked_dates')
      .insert({
        date,
        reason_en: reasonEn,
        reason_ar: reasonAr,
        created_by: user.user.id,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding blocked date:', error);
    return { success: false, error: 'Failed to block date' };
  }
}

export async function removeBlockedDate(
  dateId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('blocked_dates')
      .delete()
      .eq('id', dateId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing blocked date:', error);
    return { success: false, error: 'Failed to unblock date' };
  }
}

export async function toggleSlotBlock(
  slotId: string,
  isBlocked: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('availability_slots')
      .update({ is_blocked_by_admin: isBlocked })
      .eq('id', slotId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling slot block:', error);
    return { success: false, error: 'Failed to toggle slot' };
  }
}

export async function getPublicSlotCounts(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase.rpc('get_public_slot_counts', {
      p_service_id: serviceId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching slot counts:', error);
      return {};
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      counts[row.slot_date] = Number(row.available_count);
    }
    return counts;
  } catch (error) {
    console.error('Error calling slot counts function:', error);
    return {};
  }
}

export async function getUnavailableDatesWithReasons(
  startDate: string,
  endDate: string
): Promise<{ date: string; reason: string }[]> {
  try {
    const { data, error } = await supabase.rpc('get_unavailable_dates', {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      console.error('Error fetching unavailable dates:', error);
      return [];
    }

    return (data || []).map((row: { unavailable_date: string; reason: string }) => ({
      date: row.unavailable_date,
      reason: row.reason,
    }));
  } catch (error) {
    console.error('Error calling unavailable dates function:', error);
    return [];
  }
}

export async function getBookingsForDateRange(
  serviceId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('wakala_applications')
    .select('*, members(first_name, last_name), availability_slots!inner(service_id)')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    .not('booking_date', 'is', null)
    .eq('availability_slots.service_id', serviceId)
    .order('booking_date')
    .order('start_time');

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  return data || [];
}
