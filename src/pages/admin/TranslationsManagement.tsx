import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, X, Download, RefreshCw, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TranslationRequest {
  id: string;
  user_id: string | null;
  document_type: string;
  source_language: string;
  target_language: string;
  notes: string | null;
  file_url: string | null;
  urgency: string;
  status: string;
  amount: number | null;
  is_member: boolean;
  is_first_request: boolean;
  created_at: string;
  admin_notes?: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'cancelled'] as const;
const URGENCY_OPTIONS = ['standard', 'urgent', 'express'] as const;

export default function TranslationsManagement() {
  const [items, setItems] = useState<TranslationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selected, setSelected] = useState<TranslationRequest | null>(null);
  const [modalStatus, setModalStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('translation_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching translation requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async () => {
    if (!selected) return;
    try {
      setUpdating(true);
      const { error } = await supabase
        .from('translation_requests')
        .update({ status: modalStatus, admin_notes: adminNotes })
        .eq('id', selected.id);
      if (error) throw error;
      setToast({ message: `Status updated to ${modalStatus.replace('_', ' ')}`, type: 'success' });
      await fetchData();
      setSelected(prev => prev ? { ...prev, status: modalStatus, admin_notes: adminNotes } : null);
    } catch (error) {
      console.error('Error updating request:', error);
      setToast({ message: 'Failed to update request', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const openModal = (item: TranslationRequest) => {
    setSelected(item);
    setModalStatus(item.status);
    setAdminNotes(item.admin_notes || '');
  };

  const closeModal = () => {
    setSelected(null);
    setModalStatus('');
    setAdminNotes('');
  };

  const filtered = items.filter((i) => {
    const matchesSearch =
      i.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.source_language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.target_language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.user_id && i.user_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchesUrgency = filterUrgency === 'all' || i.urgency === filterUrgency;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Document Type', 'Source Language', 'Target Language', 'Urgency', 'Status', 'Amount', 'Member', 'First Request', 'Notes', 'Date'];
    const rows = filtered.map((i) => [
      i.id,
      i.document_type,
      i.source_language,
      i.target_language,
      i.urgency,
      i.status,
      i.amount,
      i.is_member ? 'Yes' : 'No',
      i.is_first_request ? 'Yes' : 'No',
      (i.notes || '').replace(/,/g, ';'),
      new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-slate-100 text-slate-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.pending}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const styles: Record<string, string> = {
      standard: 'bg-slate-100 text-slate-600',
      urgent: 'bg-orange-100 text-orange-700',
      express: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[urgency] || styles.standard}`}>
        {urgency}
      </span>
    );
  };

  const getMemberBadge = (isMember: boolean) => {
    return isMember ? (
      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Yes</span>
    ) : (
      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">No</span>
    );
  };

  const pendingCount = items.filter((i) => i.status === 'pending').length;
  const inProgressCount = items.filter((i) => i.status === 'in_progress').length;
  const totalRevenue = items.filter((i) => i.status === 'completed').reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Translation Requests
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage translation requests and track progress</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Requests</p>
              <p className="text-xl font-bold text-gray-900">{items.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-xl font-bold text-gray-900">{inProgressCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue (Completed)</p>
              <p className="text-xl font-bold text-gray-900">{'\u00A3'}{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by document type, language..."
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
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Urgency</option>
              <option value="standard">Standard</option>
              <option value="urgent">Urgent</option>
              <option value="express">Express</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No translation requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Document Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Languages</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Member</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Urgency</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openModal(i)}>
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        {i.document_type}
                        {i.is_first_request && (
                          <span className="inline-block px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-700">NEW</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {i.source_language} &rarr; {i.target_language}
                    </td>
                    <td className="px-4 py-3.5">{getMemberBadge(i.is_member)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{i.amount != null ? `\u00A3${i.amount.toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(i.status)}</td>
                    <td className="px-4 py-3.5">{getUrgencyBadge(i.urgency)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(i); }}
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
          Showing {filtered.length} of {items.length} requests
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.document_type}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.source_language} &rarr; {selected.target_language}
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(selected.status)}
                {getUrgencyBadge(selected.urgency)}
                {selected.is_first_request && (
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">First Request</span>
                )}
                <span className="text-sm text-gray-500">{new Date(selected.created_at).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Document Type</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.document_type}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Amount</label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{selected.amount != null ? `\u00A3${selected.amount.toLocaleString()}` : '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Source Language</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.source_language}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Target Language</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.target_language}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Member</label>
                  <div className="mt-0.5">{getMemberBadge(selected.is_member)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                  <p className="text-sm text-gray-900 mt-0.5 font-mono text-xs">{selected.user_id || '-'}</p>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Customer Notes</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {selected.file_url && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Uploaded File</label>
                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Update Status</label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal notes about this request..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={updateRequest}
                  disabled={updating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-xl flex items-center gap-2.5 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}