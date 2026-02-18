import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Scale,
  Search,
  Filter,
  Eye,
  X,
  Download,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface LegalRequest {
  id: string;
  user_id: string | null;
  service_needed: string | null;
  description: string;
  file_url: string | null;
  urgency: string;
  status: string;
  amount: number | null;
  is_member: boolean;
  is_first_request: boolean;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-800',
};

const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

export default function LegalRequestsManagement() {
  const [requests, setRequests] = useState<LegalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [selected, setSelected] = useState<LegalRequest | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('other_legal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching legal requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('other_legal_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchRequests();
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveAdminNotes = async () => {
    if (!selected) return;
    try {
      setSavingNotes(true);
      const { error } = await supabase
        .from('other_legal_requests')
        .update({ admin_notes: adminNotes })
        .eq('id', selected.id);

      if (error) throw error;
      await fetchRequests();
      setSelected((prev) => (prev ? { ...prev, admin_notes: adminNotes } : null));
    } catch (error) {
      console.error('Error saving admin notes:', error);
      alert('Failed to save admin notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const serviceOptions = Array.from(new Set(requests.map((r) => r.service_needed || ''))).filter(Boolean).sort();

  const filtered = requests.filter((r) => {
    const sn = r.service_needed || '';
    const matchesSearch =
      sn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.user_id && r.user_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesService = filterService === 'all' || sn === filterService;
    return matchesSearch && matchesStatus && matchesService;
  });

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Service Needed',
      'Description',
      'User ID',
      'Amount',
      'Status',
      'Urgency',
      'Member',
      'First Request',
      'File URL',
      'Admin Notes',
      'Date',
    ];
    const rows = filtered.map((r) => [
      r.id,
      `"${(r.service_needed || '').replace(/"/g, '""')}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      r.user_id || '',
      r.amount != null ? r.amount : '',
      r.status,
      r.urgency,
      r.is_member ? 'Yes' : 'No',
      r.is_first_request ? 'Yes' : 'No',
      r.file_url || '',
      `"${(r.admin_notes || '').replace(/"/g, '""')}"`,
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-requests-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const openModal = (item: LegalRequest) => {
    setSelected(item);
    setAdminNotes(item.admin_notes || '');
  };

  const closeModal = () => {
    setSelected(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status: string) => (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );

  const getUrgencyBadge = (urgency: string) => (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${URGENCY_COLORS[urgency] || 'bg-gray-100 text-gray-700'}`}
    >
      {urgency}
    </span>
  );

  const getMemberBadge = (isMember: boolean) => (
    <span
      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${isMember ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}
    >
      {isMember ? 'Yes' : 'No'}
    </span>
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const inProgressCount = requests.filter((r) => r.status === 'in_progress').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-7 h-7" />
            Legal Requests
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage other legal and documentation requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm border border-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Requests</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-700">{inProgressCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">In Progress</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-emerald-700">{completedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Services</option>
              {serviceOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No legal requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service Needed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openModal(r)}
                  >
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">
                      {r.service_needed}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[200px] truncate">
                      {r.description}
                    </td>
                    <td className="px-4 py-3.5">{getMemberBadge(r.is_member)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">
                      {r.amount != null ? `\u00a3${Number(r.amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(r.status)}</td>
                    <td className="px-4 py-3.5">{getUrgencyBadge(r.urgency)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(r);
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {requests.length} requests
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.service_needed}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(selected.status)}
                {getUrgencyBadge(selected.urgency)}
                {getMemberBadge(selected.is_member)}
                <span className="text-sm text-gray-500">
                  {new Date(selected.created_at).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Service Needed
                  </label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.service_needed}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Amount</label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {selected.amount != null
                      ? `\u00a3${Number(selected.amount).toLocaleString()}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Urgency</label>
                  <p className="text-sm text-gray-900 mt-0.5 capitalize">{selected.urgency}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Member</label>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {selected.is_member ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    First Request
                  </label>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {selected.is_first_request ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                  <p className="text-sm text-gray-900 mt-0.5 font-mono">
                    {selected.user_id || '-'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                  Description
                </label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {selected.description}
                </p>
              </div>

              {selected.file_url && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                    Uploaded File
                  </label>
                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View / Download File
                  </a>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                  Update Status
                </label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  disabled={updatingStatus}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
                {updatingStatus && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder="Add internal notes about this request..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                />
                <button
                  onClick={saveAdminNotes}
                  disabled={savingNotes || adminNotes === (selected.admin_notes || '')}
                  className="mt-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  {savingNotes ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
