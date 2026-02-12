import { useState, useEffect, useMemo } from 'react';
import {
  Search, Loader2, Download, UserPlus, Trash2,
  BarChart3, CheckCircle, XCircle, CalendarClock,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AddMemberModal from '../../components/admin/AddMemberModal';
import MemberProfileModal from '../../components/admin/MemberProfileModal';

interface MemberRow {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postcode: string | null;
  membership_type: string;
  business_support_tier: string | null;
  custom_amount: number | null;
  payment_frequency: string | null;
  status: string;
  start_date: string;
  expiry_date: string;
  created_at: string;
}

export default function MembershipsManagement() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/auto_expire_memberships`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      ).catch(() => {});

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (member: MemberRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const name = `${member.first_name} ${member.last_name}`;
    if (!confirm(`Are you sure you want to delete member "${name}" (${member.member_number})? This cannot be undone.`)) return;

    const previous = members;
    setMembers(prev => prev.filter(m => m.id !== member.id));

    try {
      await supabase
        .from('membership_application_family_members')
        .delete()
        .in('application_id',
          (await supabase
            .from('membership_applications')
            .select('id')
            .eq('email', member.email)
          ).data?.map(a => a.id) || []
        );

      await supabase
        .from('membership_applications')
        .delete()
        .eq('email', member.email);

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting member:', error);
      setMembers(previous);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const stats = useMemo(() => {
    const s = { total: members.length, active: 0, expired: 0 };
    for (const m of members) {
      if (m.status === 'active') s.active++;
      else s.expired++;
    }
    return s;
  }, [members]);

  const getAmountDisplay = (mem: MemberRow): string => {
    if (mem.membership_type === 'business_support' && mem.custom_amount) {
      const freq = mem.payment_frequency === 'annual' ? '/year' : mem.payment_frequency === 'monthly' ? '/month' : '';
      return `\u00A3${mem.custom_amount}${freq}`;
    }
    const prices: Record<string, number> = { individual: 20, family: 30, associate: 20, organization: 50 };
    return mem.membership_type in prices ? `\u00A3${prices[mem.membership_type]}/year` : '-';
  };

  const filtered = members.filter(mem => {
    const name = `${mem.first_name} ${mem.last_name}`.toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      mem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mem.member_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || mem.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Member No', 'Name', 'Email', 'Phone', 'Type', 'Tier', 'Amount', 'Status', 'Start Date', 'Expiry Date'];
    const rows = filtered.map(mem => [
      mem.member_number,
      `${mem.first_name} ${mem.last_name}`,
      mem.email,
      mem.phone || '',
      mem.membership_type,
      mem.business_support_tier || '',
      getAmountDisplay(mem),
      mem.status,
      new Date(mem.start_date).toLocaleDateString(),
      new Date(mem.expiry_date).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: BarChart3, bg: 'bg-slate-50', border: 'border-slate-200', iconBg: 'bg-slate-100', iconColor: 'text-slate-600', valueColor: 'text-slate-900' },
    { label: 'Active', value: stats.active, icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700' },
    { label: 'Expired', value: stats.expired, icon: XCircle, bg: 'bg-red-50', border: 'border-red-200', iconBg: 'bg-red-100', iconColor: 'text-red-600', valueColor: 'text-red-700' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      expired: 'bg-red-100 text-red-700',
      suspended: 'bg-gray-100 text-gray-600',
    };
    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status}
      </span>
    );
  };

  const isExpiringSoon = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 30;
  };

  const memberToAppFormat = (mem: MemberRow) => ({
    id: mem.id,
    user_id: mem.id,
    full_name: `${mem.first_name} ${mem.last_name}`,
    first_name: mem.first_name,
    last_name: mem.last_name,
    email: mem.email,
    phone: mem.phone || '',
    address: mem.address || '',
    city: mem.city,
    postcode: mem.postcode,
    membership_type: mem.membership_type,
    status: 'approved',
    payment_status: 'completed',
    organization_name: null,
    business_support_tier: mem.business_support_tier,
    custom_amount: mem.custom_amount,
    payment_frequency: mem.payment_frequency,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    how_did_you_hear: null,
    interests: null,
    created_at: mem.created_at,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 text-sm mt-1">All paid and verified members</p>
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

      <div className="grid grid-cols-3 gap-3">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`${card.bg} border ${card.border} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.iconBg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
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
              placeholder="Search by name, email, or member number..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Member No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(mem => (
                  <tr key={mem.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td
                      className="px-4 py-3.5 text-sm font-mono font-bold text-emerald-700 cursor-pointer"
                      onClick={() => setSelectedMember(mem)}
                    >
                      {mem.member_number}
                    </td>
                    <td
                      className="px-4 py-3.5 font-medium text-sm text-gray-900 cursor-pointer"
                      onClick={() => setSelectedMember(mem)}
                    >
                      {mem.first_name} {mem.last_name}
                    </td>
                    <td
                      className="px-4 py-3.5 text-sm text-gray-600 cursor-pointer"
                      onClick={() => setSelectedMember(mem)}
                    >
                      {mem.email}
                    </td>
                    <td
                      className="px-4 py-3.5 text-sm text-gray-600 cursor-pointer"
                      onClick={() => setSelectedMember(mem)}
                    >
                      <div className="capitalize">{mem.membership_type.replace('_', ' ')}</div>
                      {mem.business_support_tier && (
                        <div className="text-xs text-gray-400 capitalize">{mem.business_support_tier}</div>
                      )}
                    </td>
                    <td
                      className="px-4 py-3.5 text-sm font-medium text-gray-900 cursor-pointer"
                      onClick={() => setSelectedMember(mem)}
                    >
                      {getAmountDisplay(mem)}
                    </td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setSelectedMember(mem)}>
                      {getStatusBadge(mem.status)}
                    </td>
                    <td className="px-4 py-3.5 cursor-pointer" onClick={() => setSelectedMember(mem)}>
                      <div className="flex items-center gap-1.5">
                        {isExpiringSoon(mem.expiry_date) && (
                          <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
                        )}
                        <span className={`text-sm ${
                          new Date(mem.expiry_date) < new Date()
                            ? 'text-red-600 font-medium'
                            : isExpiringSoon(mem.expiry_date)
                              ? 'text-amber-600 font-medium'
                              : 'text-gray-600'
                        }`}>
                          {new Date(mem.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={e => handleDelete(mem, e)}
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
          Showing {filtered.length} of {members.length} members
        </div>
      </div>

      {selectedMember && (
        <MemberProfileModal
          membership={memberToAppFormat(selectedMember)}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSuccess={fetchMembers}
      />
    </div>
  );
}
