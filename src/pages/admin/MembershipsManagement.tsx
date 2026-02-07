import { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, Download, Check, X, Eye, UserPlus,
  BarChart3, Clock, CheckCircle, XCircle, CreditCard,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddMemberModal from '../../components/admin/AddMemberModal';

interface Membership {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string;
  address: string;
  city: string | null;
  postcode: string | null;
  membership_type: string;
  status: string;
  payment_status: string | null;
  organization_name: string | null;
  business_support_tier: string | null;
  custom_amount: number | null;
  payment_frequency: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  how_did_you_hear: string | null;
  interests: string | null;
  created_at: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function MembershipsManagement() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Membership | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('membership_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMemberships(data || []);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const s = { total: memberships.length, pending: 0, approved: 0, rejected: 0 };
    for (const m of memberships) {
      if (m.status === 'pending') s.pending++;
      else if (m.status === 'approved') s.approved++;
      else if (m.status === 'rejected') s.rejected++;
    }
    return s;
  }, [memberships]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('membership_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setToast({ message: `Application ${status} successfully`, type: 'success' });
      await fetchMemberships();
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
    setConfirmAction(null);
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('membership_applications')
        .update({ payment_status: paymentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setToast({ message: `Payment marked as ${paymentStatus}`, type: 'success' });
      await fetchMemberships();
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, payment_status: paymentStatus } : null);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      setToast({ message: 'Failed to update payment status', type: 'error' });
    }
  };

  const getFullName = (mem: Membership): string => {
    if (mem.full_name) return mem.full_name;
    if (mem.first_name && mem.last_name) return `${mem.first_name} ${mem.last_name}`;
    return mem.first_name || mem.last_name || 'N/A';
  };

  const getAmountDisplay = (mem: Membership): string => {
    if (mem.membership_type === 'business_support' && mem.custom_amount) {
      const frequency = mem.payment_frequency === 'annual' ? '/year' : mem.payment_frequency === 'monthly' ? '/month' : '';
      return `\u00A3${mem.custom_amount}${frequency}`;
    }
    const prices: Record<string, number> = { individual: 20, family: 30, associate: 20, organization: 50 };
    return mem.membership_type in prices ? `\u00A3${prices[mem.membership_type]}/year` : '-';
  };

  const filteredMemberships = memberships.filter((mem) => {
    const fullName = getFullName(mem);
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || mem.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Postcode', 'Type', 'Tier', 'Amount', 'Frequency', 'Status', 'Payment', 'Date'];
    const rows = filteredMemberships.map((mem) => [
      getFullName(mem), mem.email, mem.phone, mem.address, mem.city || '',
      mem.postcode || '', mem.membership_type, mem.business_support_tier || '',
      mem.custom_amount || '', mem.payment_frequency || '', mem.status,
      mem.payment_status || 'pending', new Date(mem.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memberships-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: BarChart3, bg: 'bg-slate-50', border: 'border-slate-200', iconBg: 'bg-slate-100', iconColor: 'text-slate-600', valueColor: 'text-slate-900' },
    { label: 'Pending', value: stats.pending, icon: Clock, bg: 'bg-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valueColor: 'text-amber-700' },
    { label: 'Approved', value: stats.approved, icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-amber-100 text-amber-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string | null) => {
    const s = status || 'pending';
    const styles: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
      pending: 'bg-gray-100 text-gray-600',
      refunded: 'bg-blue-100 text-blue-700',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[s] || styles.pending}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Applications</h1>
          <p className="text-gray-600 text-sm mt-1">Manage membership requests and renewals</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.iconBg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                {card.label === 'Pending' && card.value > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filteredMemberships.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No memberships found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMemberships.map((mem) => (
                  <tr key={mem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{getFullName(mem)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{mem.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      <div className="capitalize">{mem.membership_type.replace('_', ' ')}</div>
                      {mem.business_support_tier && (
                        <div className="text-xs text-gray-400 capitalize">{mem.business_support_tier}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{getAmountDisplay(mem)}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(mem.status)}</td>
                    <td className="px-4 py-3.5">{getPaymentBadge(mem.payment_status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(mem.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedApp(mem); setShowDetail(true); }}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {mem.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ id: mem.id, action: 'approved' })}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ id: mem.id, action: 'rejected' })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredMemberships.length} of {memberships.length} applications
        </div>
      </div>

      {showDetail && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{getFullName(selectedApp)}</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedApp.email}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedApp.status)}
                {getPaymentBadge(selectedApp.payment_status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedApp.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Membership Type</label>
                  <p className="text-sm text-gray-900 mt-0.5 capitalize">{selectedApp.membership_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedApp.address || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">City</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedApp.city || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Postcode</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedApp.postcode || '-'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</label>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{getAmountDisplay(selectedApp)}</p>
                </div>
                {selectedApp.business_support_tier && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Support Tier</label>
                    <p className="text-sm text-gray-900 mt-0.5 capitalize">{selectedApp.business_support_tier}</p>
                  </div>
                )}
                {selectedApp.organization_name && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Organization</label>
                    <p className="text-sm text-gray-900 mt-0.5">{selectedApp.organization_name}</p>
                  </div>
                )}
                {selectedApp.emergency_contact_name && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Emergency Contact</label>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {selectedApp.emergency_contact_name}
                      {selectedApp.emergency_contact_phone && ` - ${selectedApp.emergency_contact_phone}`}
                    </p>
                  </div>
                )}
                {selectedApp.how_did_you_hear && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">How Did You Hear</label>
                    <p className="text-sm text-gray-900 mt-0.5">{selectedApp.how_did_you_hear}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Applied On</label>
                  <p className="text-sm text-gray-900 mt-0.5">{new Date(selectedApp.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedApp.interests && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Interests</label>
                  <p className="text-sm text-gray-900 mt-0.5">{selectedApp.interests}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  <CreditCard className="w-3.5 h-3.5 inline mr-1" />
                  Payment Status
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'completed', 'failed', 'refunded'].map(ps => (
                    <button
                      key={ps}
                      onClick={() => updatePaymentStatus(selectedApp.id, ps)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize ${
                        selectedApp.payment_status === ps
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {ps}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </>
                )}
                {selectedApp.status !== 'pending' && (
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'pending')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {confirmAction.action === 'approved' ? 'Approve Application?' : 'Reject Application?'}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmAction.action === 'approved'
                ? 'This will approve the membership application.'
                : 'This will reject the membership application.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus(confirmAction.id, confirmAction.action)}
                className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-colors text-sm ${
                  confirmAction.action === 'approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmAction.action === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={fetchMemberships}
      />

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg shadow-xl flex items-center gap-2.5 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
