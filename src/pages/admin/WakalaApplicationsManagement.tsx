import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Search,
  Filter,
  Eye,
  X,
  Download,
  RefreshCw,
  Loader2,
  ExternalLink,
  Trash2,
} from 'lucide-react';

interface WakalaApplication {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  principal_name: string | null;
  principal_phone: string | null;
  principal_email: string | null;
  agent_name: string | null;
  wakala_type: string;
  wakala_format: string;
  beneficiary_name: string | null;
  notes: string | null;
  file_url: string | null;
  agent_passport_url: string | null;
  principal_passport_url: string | null;
  witnesses_passports_url: string | null;
  status: string;
  amount: number | null;
  is_member: boolean;
  is_first_wakala: boolean;
  payment_status: string | null;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = ['submitted', 'in_progress', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-amber-100 text-amber-800',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-800',
};

const TYPE_LABELS: Record<string, string> = {
  general: 'General',
  private: 'Private',
  sale: 'Sale',
  purchase: 'Purchase',
  property: 'Property',
  court: 'Court',
  business: 'Business',
  other: 'Other Procedures',
};

const FORMAT_LABELS: Record<string, string> = {
  standard: 'Standard',
  notarized: 'Notarized',
  apostilled: 'Apostilled',
};

export default function WakalaApplicationsManagement() {
  const [applications, setApplications] = useState<WakalaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selected, setSelected] = useState<WakalaApplication | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wakala_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching wakala applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingStatus(true);
      const { error } = await supabase
        .from('wakala_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchApplications();
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
        .from('wakala_applications')
        .update({ admin_notes: adminNotes })
        .eq('id', selected.id);

      if (error) throw error;
      await fetchApplications();
      setSelected((prev) => (prev ? { ...prev, admin_notes: adminNotes } : null));
    } catch (error) {
      console.error('Error saving admin notes:', error);
      alert('Failed to save admin notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wakala application?')) return;

    if (selected?.id === id) setSelected(null);

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: { action: 'delete', table: 'wakala_applications', id },
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.error || 'Delete failed');

      await fetchApplications();
    } catch (error: any) {
      console.error('Error deleting wakala:', error);
      alert(`Failed to delete: ${error.message || 'An unexpected error occurred'}`);
    }
  };

  const filtered = applications.filter((a) => {
    const principalName = a.principal_name || a.full_name || '';
    const agentName = a.agent_name || '';
    const matchesSearch =
      principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.phone || '').includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesType = filterType === 'all' || a.wakala_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const exportToCSV = () => {
    const headers = [
      'Principal Name', 'Agent Name', 'Phone', 'Email',
      'Wakala Type', 'Format', 'Amount', 'Status', 'Payment', 'First Wakala', 'Date',
    ];
    const rows = filtered.map((a) => [
      `"${a.principal_name || a.full_name || ''}"`,
      `"${a.agent_name || ''}"`,
      a.principal_phone || a.phone,
      a.principal_email || a.email,
      TYPE_LABELS[a.wakala_type] || a.wakala_type,
      FORMAT_LABELS[a.wakala_format] || a.wakala_format,
      a.amount != null ? a.amount : '',
      a.status, a.payment_status || 'pending',
      a.is_first_wakala ? 'Yes' : 'No',
      new Date(a.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wakala-applications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openModal = (item: WakalaApplication) => {
    setSelected(item);
    setAdminNotes(item.admin_notes || '');
  };

  const closeModal = () => {
    setSelected(null);
    setAdminNotes('');
  };

  const getStatusBadge = (status: string) => (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );

  const getPaymentBadge = (status: string | null) => {
    const s = status || 'pending';
    const styles: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700',
      paid: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-gray-100 text-gray-600',
      free: 'bg-teal-100 text-teal-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[s] || styles.pending}`}>
        {s}
      </span>
    );
  };

  const pendingCount = applications.filter((a) => a.status === 'submitted' || a.status === 'pending').length;
  const inProgressCount = applications.filter((a) => a.status === 'in_progress').length;
  const completedCount = applications.filter((a) => a.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7" />
            Wakala Applications
            {pendingCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-amber-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage wakala (power of attorney) applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
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
          <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Applications</p>
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
              placeholder="Search by name, email, or phone..."
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
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="general">General</option>
              <option value="private">Private</option>
              <option value="sale">Sale</option>
              <option value="purchase">Purchase</option>
              <option value="property">Property</option>
              <option value="court">Court</option>
              <option value="business">Business</option>
              <option value="other">Other Procedures</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No wakala applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Principal (Muwakkil)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Agent (Wakeel)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Format</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => openModal(a)}
                  >
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium text-gray-900">{a.principal_name || a.full_name}</div>
                      <div className="text-xs text-gray-500">{a.principal_phone || a.phone}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-sm text-gray-900">{a.agent_name || '-'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 capitalize">
                      {TYPE_LABELS[a.wakala_type] || a.wakala_type}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 capitalize">
                      {FORMAT_LABELS[a.wakala_format] || a.wakala_format}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">
                      {a.amount != null ? `\u00a3${Number(a.amount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3.5">{getStatusBadge(a.status)}</td>
                    <td className="px-4 py-3.5">{getPaymentBadge(a.payment_status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(a); }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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

        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {applications.length} applications
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Wakala Application</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.full_name}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 flex-wrap">
                {getStatusBadge(selected.status)}
                {getPaymentBadge(selected.payment_status)}
                {selected.is_first_wakala && (
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-teal-100 text-teal-700">First Wakala</span>
                )}
                {selected.is_member && (
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">Member</span>
                )}
                <span className="text-sm text-gray-500">
                  {new Date(selected.created_at).toLocaleString()}
                </span>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Principal (Muwakkil)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Name</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selected.principal_name || selected.full_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selected.principal_phone || selected.phone || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900 mt-0.5">{selected.principal_email || selected.email || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Agent (Wakeel)</h4>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Name</label>
                    <p className="text-sm text-gray-900 mt-0.5">{selected.agent_name || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Wakala Type</label>
                    <p className="text-sm text-gray-900 mt-0.5 capitalize">{TYPE_LABELS[selected.wakala_type] || selected.wakala_type}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Format</label>
                    <p className="text-sm text-gray-900 mt-0.5 capitalize">{FORMAT_LABELS[selected.wakala_format] || selected.wakala_format}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Amount</label>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {selected.amount != null ? `\u00a3${Number(selected.amount).toLocaleString()}` : 'Free'}
                    </p>
                  </div>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                    Customer Notes
                  </label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {selected.notes}
                  </p>
                </div>
              )}

              {(selected.agent_passport_url || selected.principal_passport_url || selected.witnesses_passports_url) && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase block">Documents</label>
                  {selected.agent_passport_url && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Agent Passport</p>
                      <a href={selected.agent_passport_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  )}
                  {selected.principal_passport_url && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Principal Passport</p>
                      <a href={selected.principal_passport_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200">
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </a>
                    </div>
                  )}
                  {selected.witnesses_passports_url && (() => {
                    let urls: string[] = [];
                    try { urls = JSON.parse(selected.witnesses_passports_url); } catch { urls = [selected.witnesses_passports_url]; }
                    return (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Witnesses Passports ({urls.length} file{urls.length !== 1 ? 's' : ''})</p>
                        <div className="flex flex-wrap gap-2">
                          {urls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200">
                              <ExternalLink className="w-3.5 h-3.5" /> Witness {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  {selected.file_url && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Other Document</p>
                      <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200">
                        <ExternalLink className="w-3.5 h-3.5" /> View / Download
                      </a>
                    </div>
                  )}
                </div>
              )}

              {!selected.agent_passport_url && !selected.principal_passport_url && !selected.witnesses_passports_url && selected.file_url && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Uploaded Document</label>
                  <a href={selected.file_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 text-blue-700 rounded-lg text-sm font-medium transition-colors border border-blue-200">
                    <ExternalLink className="w-4 h-4" /> View / Download File
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
                  placeholder="Add internal notes about this application..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                />
                <button
                  onClick={saveAdminNotes}
                  disabled={savingNotes || adminNotes === (selected.admin_notes || '')}
                  className="mt-2 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  {savingNotes && <Loader2 className="w-4 h-4 animate-spin" />}
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
