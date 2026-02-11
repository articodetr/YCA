import { useState, useEffect } from 'react';
import { Search, Loader2, Download, Check, X, Eye, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import FormResponsesViewer from '../../components/admin/FormResponsesViewer';

interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  availability: string | null;
  experience: string | null;
  why_volunteer: string | null;
  interests: string | null;
  skills: string | null;
  status: string;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function VolunteersManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVol, setSelectedVol] = useState<Volunteer | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { fetchVolunteers(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('volunteer_applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVolunteers(data || []);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setToast({ message: `Status updated to ${status}`, type: 'success' });
      await fetchVolunteers();
      if (selectedVol?.id === id) setSelectedVol(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this volunteer application?')) return;

    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setToast({ message: 'Volunteer deleted successfully', type: 'success' });
      await fetchVolunteers();
      if (selectedVol?.id === id) setSelectedVol(null);
    } catch (error) {
      console.error('Error deleting volunteer:', error);
      setToast({ message: 'Failed to delete volunteer', type: 'error' });
    }
  };

  const filtered = volunteers.filter((v) => {
    const matchesSearch = v.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Availability', 'Experience', 'Status', 'Date'];
    const rows = filtered.map(v => [
      v.full_name, v.email, v.phone, v.availability || '', v.experience || '',
      v.status, new Date(v.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `volunteers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700',
      active: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Applications</h1>
          <p className="text-gray-600 text-sm mt-1">Manage volunteer applications and inquiries</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search volunteers..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No volunteers found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Availability</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{v.full_name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{v.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{v.phone || '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{v.availability || '-'}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(v.status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedVol(v)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {v.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(v.id, 'approved')} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateStatus(v.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDelete(v.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
        <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} of {volunteers.length} applications</div>
      </div>

      {selectedVol && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedVol.full_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedVol.email}</p>
              </div>
              <button onClick={() => setSelectedVol(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div>{getStatusBadge(selectedVol.status)}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-500 uppercase">Phone</label><p className="text-sm text-gray-900 mt-0.5">{selectedVol.phone || '-'}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Availability</label><p className="text-sm text-gray-900 mt-0.5">{selectedVol.availability || '-'}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Address</label><p className="text-sm text-gray-900 mt-0.5">{selectedVol.address || '-'}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Applied On</label><p className="text-sm text-gray-900 mt-0.5">{new Date(selectedVol.created_at).toLocaleString()}</p></div>
                {selectedVol.emergency_contact_name && (
                  <div><label className="text-xs font-medium text-gray-500 uppercase">Emergency Contact</label><p className="text-sm text-gray-900 mt-0.5">{selectedVol.emergency_contact_name} {selectedVol.emergency_contact_phone && `- ${selectedVol.emergency_contact_phone}`}</p></div>
                )}
              </div>
              {selectedVol.experience && (<div><label className="text-xs font-medium text-gray-500 uppercase">Experience</label><p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedVol.experience}</p></div>)}
              {selectedVol.why_volunteer && (<div><label className="text-xs font-medium text-gray-500 uppercase">Why Volunteer</label><p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{selectedVol.why_volunteer}</p></div>)}
              {selectedVol.interests && (<div><label className="text-xs font-medium text-gray-500 uppercase">Interests</label><p className="text-sm text-gray-900 mt-1">{selectedVol.interests}</p></div>)}

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Form Responses</h3>
                <FormResponsesViewer
                  applicationId={selectedVol.id}
                  formType="volunteer"
                  language="en"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedVol.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(selectedVol.id, 'approved')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => updateStatus(selectedVol.id, 'rejected')} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {selectedVol.status !== 'pending' && (
                  <button onClick={() => updateStatus(selectedVol.id, 'pending')} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                    <Clock className="w-4 h-4" /> Reset to Pending
                  </button>
                )}
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
