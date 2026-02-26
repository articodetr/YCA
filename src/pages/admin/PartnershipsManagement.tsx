import { useEffect, useMemo, useState } from 'react';
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
  ArrowUpDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/admin/ImageUploader';

interface PartnerItem {
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

const DEFAULT_FORM: FormData = {
  name: '',
  logo_url: '',
  website_url: '',
  is_active: true,
  sort_order: 0,
};

export default function PartnershipsCollaborationsManagement() {
  const [items, setItems] = useState<PartnerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PartnerItem | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...DEFAULT_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [sortMode, setSortMode] = useState<'order' | 'date'>('order');

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchItems = async (mode: 'order' | 'date' = sortMode) => {
    try {
      setLoading(true);
      const query = supabase
        .from('partnerships_collaborations')
        .select('*');

      const { data, error } = await (mode === 'order'
        ? query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })
        : query.order('created_at', { ascending: false }));

      if (error) throw error;
      setItems((data as PartnerItem[]) || []);
    } catch (err) {
      console.error('Error fetching partnerships & collaborations:', err);
      setToast({ message: 'Failed to load partnerships & collaborations', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditing(null);
    setFormData({ ...DEFAULT_FORM });
    setShowModal(true);
  };

  const openEditModal = (item: PartnerItem) => {
    setEditing(item);
    setFormData({
      name: item.name || '',
      logo_url: item.logo_url || '',
      website_url: item.website_url || '',
      is_active: item.is_active,
      sort_order: Number(item.sort_order || 0),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({ ...DEFAULT_FORM });
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
        is_active: !!formData.is_active,
        sort_order: Number.isFinite(formData.sort_order) ? Number(formData.sort_order) : 0,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        const { error } = await supabase
          .from('partnerships_collaborations')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
        setToast({ message: 'Partner updated successfully', type: 'success' });
      } else {
        const { error } = await supabase
          .from('partnerships_collaborations')
          .insert([{ ...payload }]);
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

  const toggleActive = async (item: PartnerItem) => {
    try {
      const { error } = await supabase
        .from('partnerships_collaborations')
        .update({ is_active: !item.is_active, updated_at: new Date().toISOString() })
        .eq('id', item.id);
      if (error) throw error;
      setToast({ message: `Partner ${item.is_active ? 'deactivated' : 'activated'} successfully`, type: 'success' });
      await fetchItems();
    } catch (err) {
      console.error('Error toggling partner:', err);
      setToast({ message: 'Failed to update partner status', type: 'error' });
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

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      (i.name || '').toLowerCase().includes(q) ||
      (i.website_url || '').toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Handshake className="w-7 h-7 text-slate-700" />
            <h1 className="text-2xl font-bold text-gray-900">Partnerships &amp; Collaborations</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">Manage partner logos displayed on the website</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const next = sortMode === 'order' ? 'date' : 'order';
              setSortMode(next);
              fetchItems(next);
            }}
            className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-3 py-2.5 rounded-lg font-medium transition-colors text-sm"
            title="Toggle sorting"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortMode === 'order' ? 'Sort: Order' : 'Sort: Date'}
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Partner
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search partners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Handshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No partners found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Handshake className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {item.website_url ? (
                        <a
                          href={item.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Visit
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{item.sort_order ?? 0}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActive(item)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          item.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {item.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {item.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit Partner' : 'Add Partner'}</h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData((p) => ({ ...p, website_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold border-2 transition-colors ${
                      formData.is_active
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {formData.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    {formData.is_active ? 'Active (Visible)' : 'Inactive (Hidden)'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL (optional)</label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))}
                    placeholder="Upload below or paste a URL"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 transition-colors"
                  />
                </div>
              </div>

              <ImageUploader
                bucket="partnerships-logos"
                label="Upload Logo"
                currentImage={formData.logo_url || null}
                maxSizeMB={2}
                onUploadSuccess={(url) => setFormData((p) => ({ ...p, logo_url: url }))}
                onRemove={() => setFormData((p) => ({ ...p, logo_url: '' }))}
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold disabled:opacity-60"
                >
                  {saving ? 'Saving…' : (editing ? 'Save Changes' : 'Add Partner')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete partner?</h3>
            <p className="text-sm text-gray-600 mb-6">This will remove the partner from the list.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
