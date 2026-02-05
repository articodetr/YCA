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
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: 30 | 60;
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
    const { slot_id, duration_minutes, booking_date, start_time } = bookingData;

    if (duration_minutes === 30) {
      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: false })
        .eq('id', slot_id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const allSlots = await getAvailableSlotsForDate('', booking_date);
      const currentSlotIndex = allSlots.findIndex(s => s.id === slot_id);

      if (currentSlotIndex === -1 || currentSlotIndex >= allSlots.length - 1) {
        return { success: false, error: 'Invalid slot selection' };
      }

      const nextSlot = allSlots[currentSlotIndex + 1];

      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: false })
        .in('id', [slot_id, nextSlot.id]);

      if (error) {
        return { success: false, error: error.message };
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
      const allSlots = await getAvailableSlotsForDate('', bookingDate);
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
  durationMinutes: 30 | 60,
  bookingDate: string,
  startTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const releaseResult = await releaseSlots(
      slotId,
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
