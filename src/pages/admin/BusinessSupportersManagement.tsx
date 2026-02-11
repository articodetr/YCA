import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Search, Filter, X, Loader2, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BusinessSupporter {
  id: string;
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormData {
  name: string;
  tier: 'bronze' | 'silver' | 'gold';
  logo_url: string;
  website_url: string;
  is_active: boolean;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

const TIERS = ['bronze', 'silver', 'gold'] as const;

const TIER_STYLES: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-700',
  silver: 'bg-slate-100 text-slate-700',
  gold: 'bg-yellow-100 text-yellow-700',
};

const DEFAULT_FORM_DATA: FormData = {
  name: '',
  tier: 'bronze',
  logo_url: '',
  website_url: '',
  is_active: true,
};

export default function BusinessSupportersManagement() {
  const [supporters, setSupporters] = useState<BusinessSupporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSupporter, setEditingSupporter] = useState<BusinessSupporter | null>(null);
  const [formData, setFormData] = useState<FormData>({ ...DEFAULT_FORM_DATA });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetchSupporters();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const fetchSupporters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_supporters')
        .select('*')
        .neq('status', 'deleted_by_admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSupporters(data || []);
    } catch (error) {
      console.error('Error fetching supporters:', error);
      setToast({ message: 'Failed to load business supporters', type: 'error' });
    } finally {
      setLoading(false);
    }
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
        tier: formData.tier,
        logo_url: formData.logo_url.trim(),
        website_url: formData.website_url.trim() || null,
        is_active: formData.is_active,
      };

      if (editingSupporter) {
        const { error } = await supabase
          .from('business_supporters')
          .update(payload)
          .eq('id', editingSupporter.id);

        if (error) throw error;
        setToast({ message: 'Supporter updated successfully', type: 'success' });
      } else {
        const { error } = await supabase
          .from('business_supporters')
          .insert([payload]);

        if (error) throw error;
        setToast({ message: 'Supporter added successfully', type: 'success' });
      }

      closeModal();
      await fetchSupporters();
    } catch (error) {
      console.error('Error saving supporter:', error);
      setToast({ message: 'Failed to save supporter', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { adminDeleteRecord } = await import('../../lib/admin-api');
      const result = await adminDeleteRecord('business_supporters', id);
      if (!result.success) throw new Error(result.error);
      setToast({ message: 'Supporter deleted successfully', type: 'success' });
      setDeleteConfirm(null);
      await fetchSupporters();
    } catch (error) {
      console.error('Error deleting supporter:', error);
      setToast({ message: 'Failed to delete supporter', type: 'error' });
    }
  };

  const toggleActive = async (supporter: BusinessSupporter) => {
    try {
      const { error } = await supabase
        .from('business_supporters')
        .update({ is_active: !supporter.is_active })
        .eq('id', supporter.id);

      if (error) throw error;
      setToast({
        message: `Supporter ${supporter.is_active ? 'deactivated' : 'activated'} successfully`,
        type: 'success',
      });
      await fetchSupporters();
    } catch (error) {
      console.error('Error toggling supporter:', error);
      setToast({ message: 'Failed to update supporter status', type: 'error' });
    }
  };

  const openAddModal = () => {
    setEditingSupporter(null);
    setFormData({ ...DEFAULT_FORM_DATA });
    setShowModal(true);
  };

  const openEditModal = (supporter: BusinessSupporter) => {
    setEditingSupporter(supporter);
    setFormData({
      name: supporter.name,
      tier: supporter.tier,
      logo_url: supporter.logo_url || '',
      website_url: supporter.website_url || '',
      is_active: supporter.is_active,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupporter(null);
    setFormData({ ...DEFAULT_FORM_DATA });
  };

  const filtered = supporters.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || s.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTierBadge = (tier: string) => (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${TIER_STYLES[tier] || TIER_STYLES.bronze}`}>
      {tier}
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-slate-700" />
            <h1 className="text-2xl font-bold text-gray-900">Business Supporters</h1>
          </div>
          <p className="text-gray-600 text-sm mt-1">Manage companies and organizations supporting YCA</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Supporter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search supporters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            {['all', ...TIERS].map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors capitalize ${
                  filterTier === tier
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No business supporters found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Website</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((supporter) => (
                  <tr key={supporter.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      {supporter.logo_url ? (
                        <img
                          src={supporter.logo_url}
                          alt={supporter.name}
                          className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{supporter.name}</td>
                    <td className="px-4 py-3.5">{getTierBadge(supporter.tier)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {supporter.website_url ? (
                        <a
                          href={supporter.website_url}
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
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => toggleActive(supporter)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          supporter.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {supporter.is_active ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {supporter.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(supporter.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(supporter)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(supporter.id)}
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

        <div className="mt-4 text-sm text-gray-500">
          Showing {filtered.length} of {supporters.length} supporters
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSupporter ? 'Edit Supporter' : 'Add New Supporter'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value as 'bronze' | 'silver' | 'gold' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
                <input
                  type="text"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 inline-block">
                    <img
                      src={formData.logo_url}
                      alt="Logo preview"
                      className="w-16 h-16 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website URL</label>
                <input
                  type="text"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_active ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingSupporter ? 'Update Supporter' : 'Add Supporter'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Supporter</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this business supporter? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-xl flex items-center gap-2.5 ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
