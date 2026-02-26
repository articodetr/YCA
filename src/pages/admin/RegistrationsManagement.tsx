import { useMemo, useState, useEffect } from 'react';
import { Search, Loader2, Download, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Registration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  number_of_attendees: number;
  notes: string | null;
  status: string;
  skills: string | null;
  is_member: boolean | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  payment_status: string | null;
  ticket_type: string | null;
  amount_paid: number | null;
  booking_reference: string | null;
  dietary_requirements: string | null;
  created_at: string;
  events: { title: string } | null;
}

interface EventOption {
  id: string;
  title: string;
  date: string;
  is_paid_event?: boolean | null;
}

interface Toast { message: string; type: 'success' | 'error'; }

const STATUS_OPTIONS = ['confirmed', 'cancelled', 'attended'];

export default function RegistrationsManagement() {
  const [items, setItems] = useState<Registration[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEventId, setFilterEventId] = useState('all');
  const [selected, setSelected] = useState<Registration | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, events(title)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id,title,date,is_paid_event')
        .order('date', { ascending: false });
      if (error) throw error;
      setEvents((data as EventOption[]) || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('event_registrations').update({ status }).eq('id', id);
      if (error) throw error;
      setToast({ message: `Status updated to ${status}`, type: 'success' });
      await fetchData();
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchesSearch = i.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.events?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
      const matchesEvent = filterEventId === 'all' || i.event_id === filterEventId;
      return matchesSearch && matchesStatus && matchesEvent;
    });
  }, [items, searchTerm, filterStatus, filterEventId]);

  const selectedEvent = useMemo(() => {
    if (filterEventId === 'all') return null;
    return events.find(e => e.id === filterEventId) || null;
  }, [events, filterEventId]);

  const eventScoped = useMemo(() => {
    if (filterEventId === 'all') return items;
    return items.filter(i => i.event_id === filterEventId);
  }, [items, filterEventId]);

  const stats = useMemo(() => {
    const registrationsCount = eventScoped.length;
    const attendeesCount = eventScoped.reduce((sum, r) => sum + (r.number_of_attendees || 0), 0);
    const normalize = (s?: string | null) => (s || '').toLowerCase();
    const paidStatuses = new Set(['paid', 'completed', 'succeeded']);
    const pendingStatuses = new Set(['pending', 'requires_payment_method', 'processing']);
    const failedStatuses = new Set(['failed', 'canceled', 'cancelled']);

    const paidRegs = eventScoped.filter(r => paidStatuses.has(normalize(r.payment_status)));
    const pendingRegs = eventScoped.filter(r => pendingStatuses.has(normalize(r.payment_status)));
    const failedRegs = eventScoped.filter(r => failedStatuses.has(normalize(r.payment_status)));

    const totalPaid = paidRegs.reduce((sum, r) => sum + (typeof r.amount_paid === 'number' ? r.amount_paid : 0), 0);

    const confirmedCount = eventScoped.filter(r => r.status === 'confirmed').length;
    const attendedCount = eventScoped.filter(r => r.status === 'attended').length;
    const cancelledCount = eventScoped.filter(r => r.status === 'cancelled').length;

    return {
      registrationsCount,
      attendeesCount,
      totalPaid,
      paidCount: paidRegs.length,
      pendingCount: pendingRegs.length,
      failedCount: failedRegs.length,
      confirmedCount,
      attendedCount,
      cancelledCount,
    };
  }, [eventScoped]);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Event', 'Attendees', 'Status', 'Payment', 'Amount', 'Date'];
    const rows = filtered.map(i => [
      i.full_name, i.email, i.phone || '', i.events?.title || '',
      String(i.number_of_attendees), i.status, i.payment_status || '',
      i.amount_paid != null ? `£${i.amount_paid}` : '', new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const safeEvent = (selectedEvent?.title || '').replace(/[^a-z0-9\-_ ]/gi, '').trim().replace(/\s+/g, '-').slice(0, 40);
    const base = selectedEvent ? `registrations-${safeEvent || selectedEvent.id}` : 'registrations';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
      attended: 'bg-blue-100 text-blue-700',
    };
    return <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.confirmed}`}>{status}</span>;
  };

  const getPaymentBadge = (status: string | null) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      paid: 'bg-emerald-100 text-emerald-700',
      completed: 'bg-emerald-100 text-emerald-700',
      succeeded: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
    };
    return <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Registrations</h1>
          <p className="text-gray-600 text-sm mt-1">Manage event registrations and attendees</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search registrations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
          </div>
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="min-w-[240px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="all">All Events</option>
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} {ev.date ? `(${new Date(ev.date).toLocaleDateString()})` : ''}
              </option>
            ))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="attended">Attended</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {selectedEvent && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Event</p>
              <p className="text-sm font-semibold text-slate-900 mt-1 leading-snug">{selectedEvent.title}</p>
              <p className="text-xs text-slate-500 mt-1">{selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : ''}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Registrations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.registrationsCount}</p>
              <p className="text-xs text-gray-500 mt-1">Confirmed: {stats.confirmedCount} • Attended: {stats.attendedCount} • Cancelled: {stats.cancelledCount}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Attendees</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.attendeesCount}</p>
              <p className="text-xs text-gray-500 mt-1">Sum of “Attendees” field</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">£{stats.totalPaid.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">Paid: {stats.paidCount} • Pending: {stats.pendingCount} • Failed: {stats.failedCount}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No registrations found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{i.full_name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{i.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[200px] truncate">{i.events?.title || '-'}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(i.status)}</td>
                    <td className="px-4 py-3.5">{getPaymentBadge(i.payment_status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => setSelected(i)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} of {items.length} registrations</div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.full_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.events?.title || 'Unknown Event'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getStatusBadge(selected.status)}
                {getPaymentBadge(selected.payment_status)}
                <span className="text-sm text-gray-500">{new Date(selected.created_at).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-500 uppercase">Email</label><p className="text-sm text-gray-900 mt-0.5">{selected.email}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Phone</label><p className="text-sm text-gray-900 mt-0.5">{selected.phone || '-'}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Attendees</label><p className="text-sm text-gray-900 mt-0.5">{selected.number_of_attendees}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Ticket Type</label><p className="text-sm text-gray-900 mt-0.5 capitalize">{selected.ticket_type || '-'}</p></div>
                {selected.amount_paid != null && (
                  <div><label className="text-xs font-medium text-gray-500 uppercase">Amount Paid</label><p className="text-sm text-gray-900 mt-0.5">£{selected.amount_paid}</p></div>
                )}
                {selected.booking_reference && (
                  <div><label className="text-xs font-medium text-gray-500 uppercase">Booking Ref</label><p className="text-sm font-mono text-gray-900 mt-0.5">{selected.booking_reference}</p></div>
                )}
                <div><label className="text-xs font-medium text-gray-500 uppercase">Member</label><p className="text-sm text-gray-900 mt-0.5">{selected.is_member ? 'Yes' : 'No'}</p></div>
                {selected.dietary_requirements && (
                  <div><label className="text-xs font-medium text-gray-500 uppercase">Dietary Requirements</label><p className="text-sm text-gray-900 mt-0.5">{selected.dietary_requirements}</p></div>
                )}
              </div>

              {(selected.emergency_contact_name || selected.emergency_contact_phone) && (
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <label className="text-xs font-medium text-amber-700 uppercase mb-1 block">Emergency Contact</label>
                  <p className="text-sm text-gray-900">{selected.emergency_contact_name} {selected.emergency_contact_phone && `- ${selected.emergency_contact_phone}`}</p>
                </div>
              )}

              {selected.skills && (
                <div><label className="text-xs font-medium text-gray-500 uppercase">Skills</label><p className="text-sm text-gray-900 mt-1">{selected.skills}</p></div>
              )}
              {selected.notes && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Notes</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Update Status</label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${selected.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-xl flex items-center gap-2.5 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
