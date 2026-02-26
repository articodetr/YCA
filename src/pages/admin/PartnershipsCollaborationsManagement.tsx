import { useEffect, useRef, useState } from 'react';
import {
  Handshake,
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Loader2,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Upload,
  ArrowUpDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PartnershipCollaboration {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface FormData {
  name: string;
  logo_url: string;
  website_url: string;
  is_active: boolean;
  sort_order: number;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const DEFAULT_FORM_DATA: FormData = {
  name: '',
  logo_url: '',
  website_url: '',
  is_active: true,
  sort_order: 0,
};

export default function PartnershipsCollaborationsManagement() {
  const [items, setItems] = useState<PartnershipCollaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PartnershipCollaboration | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...DEFAULT_FORM_DATA });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
    supabase.auth
      .getUser()
      .then(({ data }) => setAdminId(data.user?.id || ''))
      .catch(() => setAdminId(''));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('partnerships_collaborations')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems((data as any) || []);
    } catch (err) {
      console.error('Error fetching partnerships & collaborations:', err);
      setToast({ message: 'Failed to load partnerships & collaborations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!adminId) {
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
      setSaving(true);
      const ext = file.name.split('.').pop() || 'png';
      const path = `${adminId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('partnerships-logos')
        .upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('partnerships-logos').getPublicUrl(path);
      setFormData((prev) => ({ ...prev, logo_url: `${urlData.publicUrl}?t=${Date.now()}` }));
      setToast({ message: 'Logo uploaded successfully', type: 'success' });
    } catch (err: any) {
      console.error('Logo upload error:', err);
      setToast({ message: err?.message || 'Failed to upload logo', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const openAddModal = () => {
    setEditing(null);
    setFormData({ ...DEFAULT_FORM_DATA });
    setShowModal(true);
  };

  const openEditModal = (item: PartnershipCollaboration) => {
    setEditing(item);
    setFormData({
      name: item.name,
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
      is_active: item.is_active,
      sort_order: item.sort_order ?? 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ ...DEFAULT_FORM_DATA });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        logo_url: formData.logo_url.trim() || null,
        website_url: formData.website_url.trim() || null,
        is_active: formData.is_active,
        sort_order: Number.isFinite(formData.sort_order) ? formData.sort_order : 0,
      };

      if (editing) {
        const { error } = await supabase
          .from('partnerships_collaborations')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        setToast({ message: 'Partner updated successfully', type: 'success' });
      } else {
        const { error } = await supabase.from('partnerships_collaborations').insert([payload]);
        if (error) throw error;
        setToast({ message: 'Partner added successfully', type: 'success' });
      }

      closeModal();
      await fetchItems();
    } catch (err) {
      console.error('Error saving partner:', err);
      setToast({ message: 'Failed to save partner', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { adminDeleteRecord } = await import('../../lib/admin-api');
      const result = await adminDeleteRecord('partnerships_collaborations', id);
      if (!result.success) throw new Error(result.error);
      setToast({ message: 'Partner deleted successfully', type: 'success' });
      setDeleteConfirm(null);
      await fetchItems();
    } catch (err) {
      console.error('Error deleting partner:', err);
      setToast({ message: 'Failed to delete partner', type: 'error' });
    }
  };

  const toggleActive = async (item: PartnershipCollaboration) => {
    try {
      const { error } = await supabase
        .from('partnerships_collaborations')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);
      if (error) throw error;
      setToast({ message: `Partner ${item.is_active ? 'deactivated' : 'activated'} successfully`, type: 'success' });
      await fetchItems();
    } catch (err) {
      console.error('Error toggling active:', err);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Handshake className="w-7 h-7 text-slate-700" />
            <h1 className="text-2xl font-bold text-gray-900">Partnerships &amp; Collaborations</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">Manage partners and collaborators displayed on the home page</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="text-xs text-gray-500">Showing {filtered.length} of {items.length}</div>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No partners found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left font-semibold px-4 py-3">Partner</th>
                  <th className="text-left font-semibold px-4 py-3">Website</th>
                  <th className="text-left font-semibold px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      Sort
                      <ArrowUpDown className="w-4 h-4" />
                    </span>
                  </th>
                  <th className="text-left font-semibold px-4 py-3">Status</th>
                  <th className="text-right font-semibold px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
                          {item.logo_url ? (
                            <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <Handshake className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.website_url ? (
                        <a
                          href={item.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.sort_order}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {item.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
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
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete partner?</h3>
            <p className="text-sm text-gray-600 mb-5">This will remove the partner from the system.</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Partner' : 'Add Partner'}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Shown on the home page under Business Support</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Partner name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData((p) => ({ ...p, website_url: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min={0}
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                </div>

                <div className="flex items-end gap-3">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                    disabled={saving}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadLogo(file);
                      e.currentTarget.value = '';
                    }}
                  />

                  <label className="ml-auto inline-flex items-center gap-2 text-sm font-medium text-gray-700 select-none">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500 mt-1">You can paste a logo URL or use Upload Logo.</p>
              </div>

              {formData.logo_url && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                    <img src={formData.logo_url} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-sm text-gray-700">Logo preview</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium inline-flex items-center gap-2"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editing ? 'Save Changes' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`rounded-xl px-4 py-3 shadow-lg border text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
