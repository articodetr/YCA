import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, Eye, X, Download, RefreshCw, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Complaint {
  id: string;
  reference_number: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  feedback_type: string;
  details: string;
  desired_outcome: string | null;
  contact_requested: boolean;
  preferred_contact_method: string | null;
  consent: boolean;
  status: string;
  admin_notes: string | null;
  admin_reviewed_by: string | null;
  admin_reviewed_at: string | null;
  created_at: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function ComplaintsManagement() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('complaints_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: Complaint) => {
    setSelected(item);
    setEditStatus(item.status);
    setEditNotes(item.admin_notes || '');
  };

  const closeModal = () => {
    setSelected(null);
    setEditStatus('');
    setEditNotes('');
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from('complaints_submissions')
        .update({
          status: editStatus,
          admin_notes: editNotes,
          admin_reviewed_at: new Date().toISOString(),
        })
        .eq('id', selected.id);
      if (error) throw error;
      setToast({ message: 'Record updated successfully', type: 'success' });
      await fetchData();
      setSelected(prev => prev ? { ...prev, status: editStatus, admin_notes: editNotes, admin_reviewed_at: new Date().toISOString() } : null);
    } catch (error) {
      console.error('Error updating record:', error);
      setToast({ message: 'Failed to update record', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(i => {
    const matchesSearch =
      i.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchesType = filterType === 'all' || i.feedback_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const exportToCSV = () => {
    const headers = ['Reference #', 'Name', 'Phone', 'Email', 'Address', 'Type', 'Details', 'Desired Outcome', 'Contact Requested', 'Preferred Contact', 'Consent', 'Status', 'Admin Notes', 'Reviewed By', 'Reviewed At', 'Date'];
    const rows = filtered.map(i => [
      i.reference_number,
      i.name,
      i.phone || '',
      i.email || '',
      i.address || '',
      i.feedback_type,
      `"${(i.details || '').replace(/"/g, '""')}"`,
      `"${(i.desired_outcome || '').replace(/"/g, '""')}"`,
      i.contact_requested ? 'Yes' : 'No',
      i.preferred_contact_method || '',
      i.consent ? 'Yes' : 'No',
      i.status,
      `"${(i.admin_notes || '').replace(/"/g, '""')}"`,
      i.admin_reviewed_by || '',
      i.admin_reviewed_at ? new Date(i.admin_reviewed_at).toLocaleDateString() : '',
      new Date(i.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-100 text-blue-700',
      under_review: 'bg-amber-100 text-amber-700',
      resolved: 'bg-emerald-100 text-emerald-700',
      closed: 'bg-slate-100 text-slate-700',
    };
    const labels: Record<string, string> = {
      new: 'New',
      under_review: 'Under Review',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.new}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      complaint: 'bg-red-100 text-red-700',
      suggestion: 'bg-emerald-100 text-emerald-700',
      general_comment: 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      complaint: 'Complaint',
      suggestion: 'Suggestion',
      general_comment: 'General Comment',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {labels[type] || type}
      </span>
    );
  };

  const newCount = items.filter(i => i.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complaints & Suggestions
            {newCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-blue-600 text-white rounded-full">
                {newCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage complaints, suggestions, and feedback submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-xl font-bold text-gray-900">{items.filter(i => i.status === 'new').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2.5 rounded-lg">
              <Eye className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Under Review</p>
              <p className="text-xl font-bold text-gray-900">{items.filter(i => i.status === 'under_review').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2.5 rounded-lg">
              <Filter className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-xl font-bold text-gray-900">{items.filter(i => i.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-lg">
              <X className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-xl font-bold text-gray-900">{items.filter(i => i.status === 'closed').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, name, email, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaint</option>
              <option value="suggestion">Suggestion</option>
              <option value="general_comment">General Comment</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No submissions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(i => (
                  <tr
                    key={i.id}
                    onClick={() => openModal(i)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${i.status === 'new' ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-4 py-3.5 font-mono text-sm font-medium text-gray-900">{i.reference_number}</td>
                    <td className="px-4 py-3.5">{getTypeBadge(i.feedback_type)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-900">{i.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(i.status)}</td>
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
        <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} of {items.length} submissions</div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Submission {selected.reference_number}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.name} - Submitted {new Date(selected.created_at).toLocaleString()}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getStatusBadge(selected.status)}
                {getTypeBadge(selected.feedback_type)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Phone</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.email || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.address || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Contact Requested</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.contact_requested ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Preferred Contact Method</label>
                  <p className="text-sm text-gray-900 mt-0.5 capitalize">{selected.preferred_contact_method || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Consent Given</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.consent ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Reviewed At</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selected.admin_reviewed_at ? new Date(selected.admin_reviewed_at).toLocaleString() : '-'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Details</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.details}</p>
              </div>

              {selected.desired_outcome && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Desired Outcome</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.desired_outcome}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Update Status</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="appearance-none w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    >
                      <option value="new">New</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Admin Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                    placeholder="Add internal notes about this submission..."
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
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
