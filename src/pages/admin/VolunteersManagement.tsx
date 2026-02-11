import { useState, useEffect } from 'react';
import { Search, Loader2, Download, Check, X, Eye, CheckCircle, XCircle, Clock, Trash2, Pencil, Save, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

interface FormResponse {
  id: string;
  question_id: string;
  response_text: string;
  question_text_en: string;
  question_text_ar: string;
  question_type: string;
  order_index: number;
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
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [editResponses, setEditResponses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

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
        .neq('status', 'deleted_by_admin')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVolunteers(data || []);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormResponses = async (applicationId: string) => {
    setLoadingResponses(true);
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('id, question_id, response_text, form_questions(question_text_en, question_text_ar, question_type, order_index)')
        .eq('form_type', 'volunteer')
        .eq('application_id', applicationId)
        .order('created_at');

      if (error) throw error;

      const mapped = (data || []).map((r: any) => ({
        id: r.id,
        question_id: r.question_id,
        response_text: r.response_text || '',
        question_text_en: r.form_questions?.question_text_en || '',
        question_text_ar: r.form_questions?.question_text_ar || '',
        question_type: r.form_questions?.question_type || 'text',
        order_index: r.form_questions?.order_index || 0,
      }));

      mapped.sort((a: FormResponse, b: FormResponse) => a.order_index - b.order_index);
      setFormResponses(mapped);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      setFormResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  const openDetail = async (v: Volunteer) => {
    setSelectedVol(v);
    setEditing(false);
    await fetchFormResponses(v.id);
  };

  const startEditing = () => {
    if (!selectedVol) return;
    setEditData({
      full_name: selectedVol.full_name || '',
      email: selectedVol.email || '',
      phone: selectedVol.phone || '',
      address: selectedVol.address || '',
      availability: selectedVol.availability || '',
      experience: selectedVol.experience || '',
      why_volunteer: selectedVol.why_volunteer || '',
      interests: selectedVol.interests || '',
      skills: selectedVol.skills || '',
      emergency_contact_name: selectedVol.emergency_contact_name || '',
      emergency_contact_phone: selectedVol.emergency_contact_phone || '',
    });
    const respMap: Record<string, string> = {};
    formResponses.forEach(r => { respMap[r.id] = r.response_text; });
    setEditResponses(respMap);
    setEditing(true);
  };

  const saveEdits = async () => {
    if (!selectedVol) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('volunteer_applications')
        .update({ ...editData, updated_at: new Date().toISOString() })
        .eq('id', selectedVol.id);
      if (error) throw error;

      for (const [responseId, text] of Object.entries(editResponses)) {
        const original = formResponses.find(r => r.id === responseId);
        if (original && original.response_text !== text) {
          await supabase.from('form_responses').update({ response_text: text }).eq('id', responseId);
        }
      }

      setToast({ message: 'Changes saved successfully', type: 'success' });
      setEditing(false);
      await fetchVolunteers();
      await fetchFormResponses(selectedVol.id);
      setSelectedVol(prev => prev ? { ...prev, ...editData } : null);
    } catch (error) {
      console.error('Error saving:', error);
      setToast({ message: 'Failed to save changes', type: 'error' });
    } finally {
      setSaving(false);
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
      const { adminDeleteRecord } = await import('../../lib/admin-api');
      const result = await adminDeleteRecord('volunteer_applications', id);
      if (!result.success) throw new Error(result.error);
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

  const editableField = (label: string, key: string, type: 'text' | 'textarea' = 'text') => {
    const value = editing ? editData[key] : selectedVol?.[key as keyof Volunteer];
    return (
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
        {editing ? (
          type === 'textarea' ? (
            <textarea
              value={editData[key] || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
              rows={3}
              className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          ) : (
            <input
              type="text"
              value={editData[key] || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          )
        ) : (
          <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">{(value as string) || '-'}</p>
        )}
      </div>
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
                        <button onClick={() => openDetail(v)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
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
              <div className="flex items-center gap-2">
                {!editing ? (
                  <button onClick={startEditing} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                ) : (
                  <>
                    <button onClick={saveEdits} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                    </button>
                    <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={() => { setSelectedVol(null); setEditing(false); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div>{getStatusBadge(selectedVol.status)}</div>
              <div className="grid grid-cols-2 gap-4">
                {editableField('Full Name', 'full_name')}
                {editableField('Email', 'email')}
                {editableField('Phone', 'phone')}
                {editableField('Address', 'address')}
                {editableField('Availability', 'availability')}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Applied On</label>
                  <p className="text-sm text-gray-900 mt-0.5">{new Date(selectedVol.created_at).toLocaleString()}</p>
                </div>
                {editableField('Emergency Contact', 'emergency_contact_name')}
                {editableField('Emergency Phone', 'emergency_contact_phone')}
              </div>
              {editableField('Skills', 'skills', 'textarea')}
              {editableField('Experience', 'experience', 'textarea')}
              {editableField('Why Volunteer', 'why_volunteer', 'textarea')}
              {editableField('Interests', 'interests', 'textarea')}

              {(formResponses.length > 0 || loadingResponses) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4" /> Form Responses
                  </h3>
                  {loadingResponses ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formResponses.map((r) => (
                        <div key={r.id}>
                          <label className="text-xs font-medium text-gray-500">{r.question_text_en}</label>
                          {editing ? (
                            r.question_type === 'textarea' ? (
                              <textarea
                                value={editResponses[r.id] || ''}
                                onChange={(e) => setEditResponses(prev => ({ ...prev, [r.id]: e.target.value }))}
                                rows={2}
                                className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                            ) : (
                              <input
                                type="text"
                                value={editResponses[r.id] || ''}
                                onChange={(e) => setEditResponses(prev => ({ ...prev, [r.id]: e.target.value }))}
                                className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                              />
                            )
                          ) : (
                            <p className="text-sm text-gray-900 mt-0.5 whitespace-pre-wrap">{r.response_text || '-'}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
