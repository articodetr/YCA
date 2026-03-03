import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Download, Eye, X, CheckCircle, XCircle, Trash2, Pencil, Save, MessageSquare, Plus, Upload, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Partnership {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  phone: string | null;
  organization_type: string | null;
  partnership_interest: string | null;
  message: string | null;
  status: string;
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

interface Toast { message: string; type: 'success' | 'error'; }

const STATUS_OPTIONS = ['new', 'contacted', 'in_progress', 'completed', 'declined'];

export default function PartnershipsManagement() {
  const [items, setItems] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Partnership | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [formResponses, setFormResponses] = useState<FormResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [editResponses, setEditResponses] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveAdminId, setApproveAdminId] = useState<string>('');
  const [approveSaving, setApproveSaving] = useState(false);
  const [approveUploading, setApproveUploading] = useState(false);
  const approveLogoInputRef = useRef<HTMLInputElement>(null);
  const [approveData, setApproveData] = useState({
    name: '',
    website_url: '',
    logo_url: '',
    is_active: true,
    sort_order: 0,
  });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('partnership_inquiries').select('*').neq('status', 'deleted_by_admin').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const fetchFormResponses = async (applicationId: string) => {
    setLoadingResponses(true);
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('id, question_id, response_text, form_questions(question_text_en, question_text_ar, question_type, order_index)')
        .eq('form_type', 'partnership')
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

  const openDetail = async (p: Partnership) => {
    setSelected(p);
    setEditing(false);
    await fetchFormResponses(p.id);
  };

  const openApprove = async () => {
    if (!selected) return;
    setApproveData({
      name: selected.organization_name || '',
      website_url: '',
      logo_url: '',
      is_active: true,
      sort_order: 0,
    });
    setShowApproveModal(true);

    // Get admin session (needed for logo uploads)
    try {
      const { data } = await supabase.auth.getUser();
      setApproveAdminId(data.user?.id || '');
    } catch {
      setApproveAdminId('');
    }
  };

  const closeApprove = () => {
    setShowApproveModal(false);
    setApproveUploading(false);
    setApproveSaving(false);
    setApproveData({ name: '', website_url: '', logo_url: '', is_active: true, sort_order: 0 });
  };

  const uploadApproveLogo = async (file: File) => {
    if (!approveAdminId) {
      setToast({ message: 'Unable to upload: admin session not found', type: 'error' });
      return;
    }

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setToast({ message: 'Unsupported file type (JPG/PNG/WebP only)', type: 'error' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: 'File is too large (max 2MB)', type: 'error' });
      return;
    }

    try {
      setApproveUploading(true);
      const ext = file.name.split('.').pop() || 'png';
      const path = `${approveAdminId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('partnerships-logos')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('partnerships-logos').getPublicUrl(path);
      setApproveData((prev) => ({ ...prev, logo_url: `${urlData.publicUrl}?t=${Date.now()}` }));
      setToast({ message: 'Logo uploaded successfully', type: 'success' });
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setToast({ message: err?.message || 'Failed to upload logo', type: 'error' });
    } finally {
      setApproveUploading(false);
    }
  };

  const approveAndAddToHome = async () => {
    if (!selected) return;
    const name = approveData.name.trim();
    if (!name) {
      setToast({ message: 'Partner name is required', type: 'error' });
      return;
    }

    try {
      setApproveSaving(true);

      // Avoid duplicates
      const { data: existing, error: existingError } = await supabase
        .from('partnerships_collaborations')
        .select('id')
        .eq('name', name)
        .limit(1);
      if (existingError) throw existingError;
      if (existing && existing.length > 0) {
        setToast({ message: 'This partner already exists in the home page list', type: 'error' });
        return;
      }

      const payload = {
        name,
        logo_url: approveData.logo_url.trim() || null,
        website_url: approveData.website_url.trim() || null,
        is_active: approveData.is_active,
        sort_order: Number.isFinite(approveData.sort_order) ? approveData.sort_order : 0,
      };

      const { error: insertError } = await supabase
        .from('partnerships_collaborations')
        .insert([payload]);
      if (insertError) throw insertError;

      // Mark inquiry as completed (approved)
      const { error: updateError } = await supabase
        .from('partnership_inquiries')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (updateError) throw updateError;

      setToast({ message: 'Approved and added to home page successfully', type: 'success' });
      closeApprove();
      await fetchData();
      setSelected((prev) => (prev ? { ...prev, status: 'completed' } : null));
    } catch (err) {
      console.error('Approve error:', err);
      setToast({ message: 'Failed to approve and add to home page', type: 'error' });
    } finally {
      setApproveSaving(false);
    }
  };

  const startEditing = () => {
    if (!selected) return;
    setEditData({
      organization_name: selected.organization_name || '',
      contact_person: selected.contact_person || '',
      email: selected.email || '',
      phone: selected.phone || '',
      organization_type: selected.organization_type || '',
      partnership_interest: selected.partnership_interest || '',
      message: selected.message || '',
    });
    const respMap: Record<string, string> = {};
    formResponses.forEach(r => { respMap[r.id] = r.response_text; });
    setEditResponses(respMap);
    setEditing(true);
  };

  const saveEdits = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('partnership_inquiries')
        .update({ ...editData, updated_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (error) throw error;

      for (const [responseId, text] of Object.entries(editResponses)) {
        const original = formResponses.find(r => r.id === responseId);
        if (original && original.response_text !== text) {
          await supabase.from('form_responses').update({ response_text: text }).eq('id', responseId);
        }
      }

      setToast({ message: 'Changes saved successfully', type: 'success' });
      setEditing(false);
      await fetchData();
      await fetchFormResponses(selected.id);
      setSelected(prev => prev ? { ...prev, ...editData } : null);
    } catch (error) {
      console.error('Error saving:', error);
      setToast({ message: 'Failed to save changes', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('partnership_inquiries').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setToast({ message: `Status updated to ${status}`, type: 'success' });
      await fetchData();
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partnership inquiry?')) return;
    try {
      const { adminDeleteRecord } = await import('../../lib/admin-api');
      const result = await adminDeleteRecord('partnership_inquiries', id);
      if (!result.success) throw new Error(result.error);
      setToast({ message: 'Partnership deleted successfully', type: 'success' });
      await fetchData();
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Failed to delete partnership', type: 'error' });
    }
  };

  const filtered = items.filter(i =>
    i.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Organization', 'Contact', 'Email', 'Phone', 'Type', 'Status', 'Date'];
    const rows = filtered.map(i => [i.organization_name, i.contact_person, i.email, i.phone || '', i.organization_type || '', i.status, new Date(i.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `partnerships-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { new: 'bg-blue-100 text-blue-700', contacted: 'bg-amber-100 text-amber-700', in_progress: 'bg-cyan-100 text-cyan-700', completed: 'bg-emerald-100 text-emerald-700', declined: 'bg-red-100 text-red-700' };
    return <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.new}`}>{status.replace('_', ' ')}</span>;
  };

  const editableField = (label: string, key: string, type: 'text' | 'textarea' = 'text') => {
    const value = editing ? editData[key] : selected?.[key as keyof Partnership];
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
          <h1 className="text-2xl font-bold text-gray-900">Partnership Requests</h1>
          <p className="text-gray-600 text-sm mt-1">Manage partnership and collaboration inquiries</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search partnerships..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No partnerships found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Organization</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(i => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{i.organization_name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{i.contact_person}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{i.email}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(i.status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDetail(i)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(i.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
        <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} of {items.length} partnerships</div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.organization_name}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.contact_person} - {selected.email}</p>
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
                <button onClick={() => { setSelected(null); setEditing(false); }} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              <div>{getStatusBadge(selected.status)}</div>
              <div className="grid grid-cols-2 gap-4">
                {editableField('Organization Name', 'organization_name')}
                {editableField('Contact Person', 'contact_person')}
                {editableField('Email', 'email')}
                {editableField('Phone', 'phone')}
                {editableField('Organization Type', 'organization_type')}
                {editableField('Partnership Interest', 'partnership_interest')}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Date</label>
                  <p className="text-sm text-gray-900 mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>
              {editableField('Message', 'message', 'textarea')}

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

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Home Page Display</h3>
                <p className="text-sm text-gray-600 mb-3">
                  To show this partner on the home page (Partnerships &amp; Collaborations), you must approve it and add it to the list.
                </p>
                <button
                  onClick={openApprove}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" /> Approve &amp; Add to Home Page
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Update Status</label>
                <div className="flex gap-2 flex-wrap">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${selected.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                      {s.replace('_', ' ')}
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

      {showApproveModal && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add to Partnerships &amp; Collaborations</h3>
                <p className="text-sm text-gray-600 mt-1">This will control what appears on the home page.</p>
              </div>
              <button onClick={closeApprove} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Official Name</label>
                <input
                  type="text"
                  value={approveData.name}
                  onChange={(e) => setApproveData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Website URL</label>
                <div className="relative">
                  <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="https://example.com"
                    value={approveData.website_url}
                    onChange={(e) => setApproveData((p) => ({ ...p, website_url: e.target.value }))}
                    className="w-full mt-1 pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Logo</label>
                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => approveLogoInputRef.current?.click()}
                    disabled={approveUploading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {approveUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload logo
                  </button>
                  <input
                    ref={approveLogoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadApproveLogo(file);
                      // reset input so same file can be re-selected
                      if (e.target) e.target.value = '';
                    }}
                  />

                  <input
                    type="text"
                    placeholder="Or paste logo URL"
                    value={approveData.logo_url}
                    onChange={(e) => setApproveData((p) => ({ ...p, logo_url: e.target.value }))}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Sort Order</label>
                  <input
                    type="number"
                    value={approveData.sort_order}
                    onChange={(e) => setApproveData((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={approveData.is_active}
                      onChange={(e) => setApproveData((p) => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    Show on home page
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={closeApprove}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={approveAndAddToHome}
                disabled={approveSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {approveSaving ? <span className="inline-flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span> : 'Approve & Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
