import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Loader2, X, Ticket } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  capacity: number | null;
  image_url: string | null;
  is_featured: boolean;
  is_paid_event: boolean;
  ticket_price_adult: number | null;
  ticket_price_child: number | null;
  ticket_price_member: number | null;
}

interface FormState {
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  category: string;
  date: string;
  time: string;
  location: string;
  location_ar: string;
  capacity: string;
  image_url: string;
  is_featured: boolean;
  is_paid_event: boolean;
  ticket_price_adult: string;
  ticket_price_child: string;
  ticket_price_member: string;
}

const defaultForm: FormState = {
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  category: 'Community Events',
  date: '',
  time: '',
  location: '',
  location_ar: '',
  capacity: '',
  image_url: '',
  is_featured: false,
  is_paid_event: false,
  ticket_price_adult: '',
  ticket_price_child: '',
  ticket_price_member: '',
};

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      const ev = event as any;
      setFormData({
        title: event.title,
        title_ar: ev.title_ar || '',
        description: event.description,
        description_ar: ev.description_ar || '',
        category: event.category,
        date: event.date,
        time: event.time,
        location: event.location,
        location_ar: ev.location_ar || '',
        capacity: event.capacity?.toString() || '',
        image_url: event.image_url || '',
        is_featured: event.is_featured,
        is_paid_event: event.is_paid_event || false,
        ticket_price_adult: event.ticket_price_adult?.toString() || '',
        ticket_price_child: event.ticket_price_child?.toString() || '',
        ticket_price_member: event.ticket_price_member?.toString() || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({ ...defaultForm });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.is_paid_event && !formData.ticket_price_adult) {
      alert('Please enter the adult ticket price for paid events');
      return;
    }

    setSaving(true);

    try {
      const eventData: Record<string, any> = {
        title: formData.title,
        title_ar: formData.title_ar || null,
        description: formData.description,
        description_ar: formData.description_ar || null,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        location_ar: formData.location_ar || null,
        max_capacity: formData.capacity ? parseInt(formData.capacity) : null,
        image_url: formData.image_url || null,
        is_featured: formData.is_featured,
        is_paid_event: formData.is_paid_event,
        ticket_price_adult: formData.is_paid_event && formData.ticket_price_adult ? parseFloat(formData.ticket_price_adult) : null,
        ticket_price_child: formData.is_paid_event && formData.ticket_price_child ? parseFloat(formData.ticket_price_child) : null,
        ticket_price_member: formData.is_paid_event && formData.ticket_price_member ? parseFloat(formData.ticket_price_member) : null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;
        alert('Event updated successfully!');
      } else {
        const { error } = await supabase.from('events').insert([eventData]);

        if (error) throw error;
        alert('Event created successfully!');
      }

      await fetchEvents();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(`Failed to save event: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputCls = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1 text-sm">Manage events and activities</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Event
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 sm:py-3 text-left font-semibold text-gray-900">Title</th>
                  <th className="px-3 py-2 sm:py-3 text-left font-semibold text-gray-900">Category</th>
                  <th className="px-3 py-2 sm:py-3 text-left font-semibold text-gray-900">Date & Time</th>
                  <th className="px-3 py-2 sm:py-3 text-left font-semibold text-gray-900">Type</th>
                  <th className="px-3 py-2 sm:py-3 text-left font-semibold text-gray-900">Price</th>
                  <th className="px-3 py-2 sm:py-3 text-right font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 sm:py-4">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-gray-500 line-clamp-1 hidden sm:block">{event.description}</p>
                    </td>
                    <td className="px-3 py-3 sm:py-4 text-gray-600">{event.category}</td>
                    <td className="px-3 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                      {new Date(event.date).toLocaleDateString()}
                      <br />
                      <span className="text-gray-400">{event.time}</span>
                    </td>
                    <td className="px-3 py-3 sm:py-4">
                      {event.is_paid_event ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          <Ticket className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
                      {event.is_paid_event && event.ticket_price_adult
                        ? `£${Number(event.ticket_price_adult).toFixed(2)}`
                        : '-'}
                    </td>
                    <td className="px-3 py-3 sm:py-4">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => handleOpenModal(event)}
                          className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-2xl md:max-w-3xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Arabic) <span className="text-gray-400">العنوان</span></label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className={inputCls}
                  dir="rtl"
                  placeholder="أدخل العنوان بالعربية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputCls}
                >
                  <option value="Community Events">Community Events</option>
                  <option value="Workshops">Workshops</option>
                  <option value="Training">Training</option>
                  <option value="Fundraising">Fundraising</option>
                  <option value="Youth Activities">Youth Activities</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location (Arabic) <span className="text-gray-400">الموقع</span></label>
                <input
                  type="text"
                  value={formData.location_ar}
                  onChange={(e) => setFormData({ ...formData, location_ar: e.target.value })}
                  className={inputCls}
                  dir="rtl"
                  placeholder="أدخل الموقع بالعربية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity (optional)</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className={inputCls}
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Ticket className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Paid Event</p>
                      <p className="text-xs text-gray-500">Enable if this event requires payment</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_paid_event}
                      onChange={(e) => setFormData({ ...formData, is_paid_event: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {formData.is_paid_event && (
                  <div className="space-y-4 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Adult Price (£) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                          <input
                            type="number"
                            value={formData.ticket_price_adult}
                            onChange={(e) => setFormData({ ...formData, ticket_price_adult: e.target.value })}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                            placeholder="10.00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Child Price (£)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                          <input
                            type="number"
                            value={formData.ticket_price_child}
                            onChange={(e) => setFormData({ ...formData, ticket_price_child: e.target.value })}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                            placeholder="5.00"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Leave empty if not applicable</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Member Price (£)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                          <input
                            type="number"
                            value={formData.ticket_price_member}
                            onChange={(e) => setFormData({ ...formData, ticket_price_member: e.target.value })}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            min="0"
                            step="0.01"
                            placeholder="8.00"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Discounted price for members</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                      Users will need to complete payment via Stripe before their registration is confirmed.
                    </div>
                  </div>
                )}
              </div>

              <div>
                <ImageUploader
                  bucket="event-images"
                  currentImage={formData.image_url}
                  onUploadSuccess={(url) => setFormData({ ...formData, image_url: url })}
                  label="Event Image (optional)"
                  maxSizeMB={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className={inputCls}
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Links are supported. Use{' '}
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">[link text](https://example.com)</span>
                  {' '}or paste a full URL (https://...) and it will be clickable.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (Arabic) <span className="text-gray-400">الوصف</span></label>
                <textarea
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={4}
                  className={inputCls}
                  dir="rtl"
                  placeholder="أدخل الوصف بالعربية"
                />
                <p className="text-xs text-gray-500 mt-2" dir="rtl">
                  يمكنك إضافة روابط داخل النص. استخدم الصيغة:
                  {' '}
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded" dir="ltr">[نص الرابط](https://example.com)</span>
                  {' '}أو ضع رابطًا مباشرًا (https://...) وسيظهر قابلًا للضغط.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Mark as featured event
                </label>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
