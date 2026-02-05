import { useState, useEffect } from 'react';
import { Clock, Lock, Unlock, RefreshCw, X, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  formatTime,
  regenerateSlotsForDate,
  toggleSlotBlock,
  addBlockedDate,
  removeBlockedDate,
  AvailabilityStats,
} from '../../lib/booking-utils';

interface SlotDetail {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  is_blocked_by_admin: boolean;
  booking?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    service_type: string;
  };
}

interface DayDetailsPanelProps {
  date: string | null;
  serviceId: string;
  stats: AvailabilityStats | undefined;
  onClose: () => void;
  onUpdate: () => void;
}

export default function DayDetailsPanel({
  date,
  serviceId,
  stats,
  onClose,
  onUpdate,
}: DayDetailsPanelProps) {
  const [slots, setSlots] = useState<SlotDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [blockingDate, setBlockingDate] = useState(false);
  const [blockReason, setBlockReason] = useState({ en: '', ar: '' });
  const [showBlockForm, setShowBlockForm] = useState(false);

  useEffect(() => {
    if (date) {
      loadSlots();
    }
  }, [date]);

  const loadSlots = async () => {
    if (!date) return;

    setLoading(true);
    try {
      const { data: slotsData, error: slotsError } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('service_id', serviceId)
        .eq('date', date)
        .order('start_time');

      if (slotsError) throw slotsError;

      const slotsWithBookings = await Promise.all(
        (slotsData || []).map(async (slot) => {
          const { data: booking } = await supabase
            .from('wakala_applications')
            .select('id, full_name, email, phone, service_type')
            .eq('slot_id', slot.id)
            .maybeSingle();

          return {
            ...slot,
            booking: booking || undefined,
          };
        })
      );

      setSlots(slotsWithBookings);
    } catch (error) {
      console.error('Error loading slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateSlots = async () => {
    if (!date) return;

    setRegenerating(true);
    try {
      const result = await regenerateSlotsForDate(serviceId, date);
      if (result) {
        alert(
          `Regeneration complete!\nNew slots created: ${result.slots_created}\nBooked slots preserved: ${result.slots_preserved}`
        );
        await loadSlots();
        onUpdate();
      }
    } catch (error) {
      console.error('Error regenerating slots:', error);
      alert('Failed to regenerate slots. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleSlotBlock = async (slotId: string, currentlyBlocked: boolean) => {
    try {
      const result = await toggleSlotBlock(slotId, !currentlyBlocked);
      if (result.success) {
        await loadSlots();
        onUpdate();
      } else {
        alert(`Failed to ${currentlyBlocked ? 'unblock' : 'block'} slot: ${result.error}`);
      }
    } catch (error) {
      console.error('Error toggling slot:', error);
    }
  };

  const handleBlockDate = async () => {
    if (!date || !blockReason.en.trim()) {
      alert('Please enter a reason in English');
      return;
    }

    setBlockingDate(true);
    try {
      const result = await addBlockedDate(date, blockReason.en, blockReason.ar);
      if (result.success) {
        alert('Date blocked successfully!');
        setShowBlockForm(false);
        setBlockReason({ en: '', ar: '' });
        await loadSlots();
        onUpdate();
      } else {
        alert(`Failed to block date: ${result.error}`);
      }
    } catch (error) {
      console.error('Error blocking date:', error);
      alert('Failed to block date. Please try again.');
    } finally {
      setBlockingDate(false);
    }
  };

  const handleUnblockDate = async () => {
    if (!date || !stats?.is_blocked) return;

    try {
      const { data: blockedDate } = await supabase
        .from('blocked_dates')
        .select('id')
        .eq('date', date)
        .maybeSingle();

      if (blockedDate) {
        const result = await removeBlockedDate(blockedDate.id);
        if (result.success) {
          alert('Date unblocked successfully!');
          await loadSlots();
          onUpdate();
        } else {
          alert(`Failed to unblock date: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error unblocking date:', error);
      alert('Failed to unblock date. Please try again.');
    }
  };

  if (!date) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Select a date from the calendar to view details</p>
      </div>
    );
  }

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{formattedDate}</h3>
            {stats && (
              <div className="flex gap-3 mt-2 text-sm">
                <span className="text-green-600 font-medium">
                  Available: {stats.available_slots}
                </span>
                <span className="text-blue-600 font-medium">
                  Booked: {stats.booked_slots}
                </span>
                {stats.blocked_slots > 0 && (
                  <span className="text-red-600 font-medium">
                    Blocked: {stats.blocked_slots}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRegenerateSlots}
            disabled={regenerating}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
            {regenerating ? 'Regenerating...' : 'Regenerate Slots'}
          </button>

          {stats?.is_blocked ? (
            <button
              onClick={handleUnblockDate}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Unlock className="w-4 h-4" />
              Unblock Date
            </button>
          ) : (
            <button
              onClick={() => setShowBlockForm(!showBlockForm)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <Lock className="w-4 h-4" />
              Block Date
            </button>
          )}
        </div>

        {showBlockForm && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-semibold text-red-900 mb-3">Block This Date</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (English) *
                </label>
                <input
                  type="text"
                  value={blockReason.en}
                  onChange={(e) => setBlockReason({ ...blockReason, en: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g., Public Holiday"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Arabic)
                </label>
                <input
                  type="text"
                  value={blockReason.ar}
                  onChange={(e) => setBlockReason({ ...blockReason, ar: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="مثلاً: عطلة رسمية"
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBlockDate}
                  disabled={blockingDate || !blockReason.en.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                >
                  {blockingDate ? 'Blocking...' : 'Confirm Block'}
                </button>
                <button
                  onClick={() => {
                    setShowBlockForm(false);
                    setBlockReason({ en: '', ar: '' });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {stats?.is_blocked && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                This date is blocked: {stats.blocked_reason_en}
              </p>
              {stats.blocked_reason_ar && (
                <p className="text-sm text-red-700 mt-1" dir="rtl">
                  {stats.blocked_reason_ar}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p>No slots available for this date</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 rounded-lg border-2 ${
                  slot.booking
                    ? 'bg-blue-50 border-blue-200'
                    : slot.is_blocked_by_admin
                    ? 'bg-gray-100 border-gray-300'
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                      {slot.is_blocked_by_admin && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          Blocked
                        </span>
                      )}
                    </div>
                    {slot.booking && (
                      <div className="mt-2 text-sm space-y-1">
                        <p className="text-gray-700">
                          <span className="font-medium">Name:</span> {slot.booking.full_name}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span> {slot.booking.email}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Phone:</span> {slot.booking.phone}
                        </p>
                        {slot.booking.service_type && (
                          <p className="text-gray-700">
                            <span className="font-medium">Service:</span>{' '}
                            {slot.booking.service_type}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {!slot.booking && (
                    <button
                      onClick={() =>
                        handleToggleSlotBlock(slot.id, slot.is_blocked_by_admin)
                      }
                      className={`ml-2 p-2 rounded-lg transition-colors ${
                        slot.is_blocked_by_admin
                          ? 'bg-green-100 hover:bg-green-200 text-green-700'
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                      title={slot.is_blocked_by_admin ? 'Unblock slot' : 'Block slot'}
                    >
                      {slot.is_blocked_by_admin ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
