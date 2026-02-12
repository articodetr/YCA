import { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, Download, UserPlus, Trash2,
  BarChart3, Clock, CheckCircle, XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddMemberModal from '../../components/admin/AddMemberModal';
import MemberProfileModal from '../../components/admin/MemberProfileModal';

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

export default function MembershipsManagement() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Membership | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    fetchMemberships();
  }, []);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const mem = memberships.find((m) => m.id === id);
    if (!mem) return;

    const msg = mem.status === 'approved' || mem.payment_status === 'completed'
      ? 'This member has an active membership. Deleting will remove their application, member record, and account from the database. Continue?'
      : 'Are you sure you want to delete this membership application?';
    if (!confirm(msg)) return;

    const previous = memberships;
    setMemberships((prev) => prev.filter((m) => m.id !== id));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-operations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: 'delete', table: 'membership_applications', id }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Server error ${res.status}`);
      }
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Delete failed');
    } catch (error: any) {
      console.error('Error deleting membership:', error);
      setMemberships(previous);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const uniqueMemberships = useMemo(() => {
    const emailMap = new Map<string, Membership>();
    for (const mem of memberships) {
      const key = mem.email.toLowerCase();
      const existing = emailMap.get(key);
      if (!existing) {
        emailMap.set(key, mem);
      } else {
        const existingPaid = existing.payment_status === 'completed';
        const currentPaid = mem.payment_status === 'completed';
        if (currentPaid && !existingPaid) {
          emailMap.set(key, mem);
        } else if (currentPaid === existingPaid && new Date(mem.created_at) > new Date(existing.created_at)) {
          emailMap.set(key, mem);
        }
      }
    }
    return Array.from(emailMap.values());
  }, [memberships]);

  const stats = useMemo(() => {
    const s = { total: uniqueMemberships.length, pending: 0, approved: 0, rejected: 0 };
    for (const m of uniqueMemberships) {
      if (m.status === 'pending') s.pending++;
      else if (m.status === 'approved') s.approved++;
      else if (m.status === 'rejected') s.rejected++;
    }
    return s;
  }, [uniqueMemberships]);

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

  const filteredMemberships = uniqueMemberships.filter((mem) => {
    const fullName = getFullName(mem);
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all'
      || (filterStatus === 'paid' ? mem.payment_status === 'completed' : mem.status === filterStatus);
    return matchesSearch && matchesFilter;
  });

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL membership applications? This cannot be undone.')) return;
    if (!confirm('This will permanently remove all applications. Confirm again to proceed.')) return;

    setDeletingAll(true);
    const total = memberships.length;
    try {
      const { adminDeleteRecord } = await import('../../lib/admin-api');
      let failed = 0;
      for (const mem of memberships) {
        const result = await adminDeleteRecord('membership_applications', mem.id);
        if (!result.success) failed++;
        else setMemberships((prev) => prev.filter((m) => m.id !== mem.id));
      }
      if (failed > 0) {
        alert(`Deleted ${total - failed} applications. ${failed} failed.`);
        fetchMemberships();
      } else {
        alert(`All ${total} applications deleted.`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      fetchMemberships();
    } finally {
      setDeletingAll(false);
    }
  };

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
          {memberships.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deletingAll ? 'Deleting...' : 'Delete All'}
            </button>
          )}
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
            <option value="paid">Paid</option>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMemberships.map((mem) => (
                  <tr
                    key={mem.id}
                    className="hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900 cursor-pointer" onClick={() => setSelectedApp(mem)}>{getFullName(mem)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 cursor-pointer" onClick={() => setSelectedApp(mem)}>{mem.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 cursor-pointer" onClick={() => setSelectedApp(mem)}>
                      <div className="capitalize">{mem.membership_type.replace('_', ' ')}</div>
                      {mem.business_support_tier && (
                        <div className="text-xs text-gray-400 capitalize">{mem.business_support_tier}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900 cursor-pointer" onClick={() => setSelectedApp(mem)}>{getAmountDisplay(mem)}</td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setSelectedApp(mem)}>{getStatusBadge(mem.status)}</td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setSelectedApp(mem)}>{getPaymentBadge(mem.payment_status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 cursor-pointer" onClick={() => setSelectedApp(mem)}>{new Date(mem.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={(e) => handleDelete(mem.id, e)}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredMemberships.length} of {uniqueMemberships.length} unique applications
        </div>
      </div>

      {selectedApp && (
        <MemberProfileModal
          membership={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={fetchMemberships}
      />
    </div>
  );
}
