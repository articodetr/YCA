import { useState, useEffect } from 'react';
import { Search, Loader2, Download, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  created_at: string;
}

export default function MembershipsManagement() {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('membership_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchMemberships();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
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
      return `£${mem.custom_amount}${frequency}`;
    }
    const prices: Record<string, number> = {
      individual: 20,
      family: 30,
      associate: 20,
    };
    return mem.membership_type in prices ? `£${prices[mem.membership_type]}/year` : '-';
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
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Postcode', 'Membership Type', 'Support Tier', 'Amount', 'Frequency', 'Status', 'Payment Status', 'Date'];
    const rows = filteredMemberships.map((mem) => [
      getFullName(mem),
      mem.email,
      mem.phone,
      mem.address,
      mem.city || '',
      mem.postcode || '',
      mem.membership_type,
      mem.business_support_tier || '',
      mem.custom_amount || '',
      mem.payment_frequency || '',
      mem.status,
      mem.payment_status || 'pending',
      new Date(mem.created_at).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memberships-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Applications</h1>
          <p className="text-gray-600 mt-1">Manage membership requests and renewals</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search memberships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMemberships.map((mem) => (
                  <tr key={mem.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{getFullName(mem)}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{mem.email}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{mem.phone}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      <div className="capitalize">{mem.membership_type.replace('_', ' ')}</div>
                      {mem.membership_type === 'business_support' && mem.business_support_tier && (
                        <div className="text-xs text-gray-500 capitalize">{mem.business_support_tier}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {getAmountDisplay(mem)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          mem.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : mem.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {mem.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {mem.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateStatus(mem.id, 'approved')}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(mem.id, 'rejected')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredMemberships.length} of {memberships.length} applications
        </div>
      </div>
    </div>
  );
}
