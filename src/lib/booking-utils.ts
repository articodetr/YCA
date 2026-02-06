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

  return data || [];
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

export async function reserveSlots(
  bookingData: BookingData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { slot_id, service_id, duration_minutes, booking_date, start_time } = bookingData;

    if (duration_minutes === 30) {
      // Use atomic reservation function with row-level locking
      const { data, error } = await supabase.rpc('reserve_availability_slot', {
        p_slot_id: slot_id,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Check the result from the function
      if (!data.success) {
        return { success: false, error: data.error || 'Slot is no longer available' };
      }
    } else {
      // For 60-minute bookings, we need to reserve two consecutive slots
      const allSlots = await getAvailableSlotsForDate(service_id, booking_date);
      const currentSlotIndex = allSlots.findIndex(s => s.id === slot_id);

      if (currentSlotIndex === -1 || currentSlotIndex >= allSlots.length - 1) {
        return { success: false, error: 'Invalid slot selection' };
      }

      const nextSlot = allSlots[currentSlotIndex + 1];

      // Reserve both slots atomically
      const { data: firstData, error: firstError } = await supabase.rpc('reserve_availability_slot', {
        p_slot_id: slot_id,
      });

      if (firstError || !firstData?.success) {
        return { success: false, error: firstData?.error || 'First slot is no longer available' };
      }

      const { data: secondData, error: secondError } = await supabase.rpc('reserve_availability_slot', {
        p_slot_id: nextSlot.id,
      });

      if (secondError || !secondData?.success) {
        // If second slot fails, release the first slot
        await supabase.rpc('release_availability_slot', { p_slot_id: slot_id });
        return { success: false, error: secondData?.error || 'Second slot is no longer available' };
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
      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: true })
        .eq('id', slotId);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const allSlots = await getAvailableSlotsForDate(serviceId, bookingDate);
      const currentSlotIndex = allSlots.findIndex(s => s.id === slotId);

      if (currentSlotIndex === -1 || currentSlotIndex >= allSlots.length - 1) {
        return { success: false, error: 'Invalid slot' };
      }

      const nextSlot = allSlots[currentSlotIndex + 1];

      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: true })
        .in('id', [slotId, nextSlot.id]);

      if (error) {
        return { success: false, error: error.message };
      }
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
  const slotDateTime = new Date(`${date}T${startTime}`);
  return slotDateTime < new Date();
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
