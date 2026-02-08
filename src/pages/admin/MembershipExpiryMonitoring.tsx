import { useState, useEffect } from 'react';
import { Search, Download, Mail, AlertCircle, Clock, CheckCircle, XCircle, Loader2, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import ExportDialog from '../../components/admin/ExportDialog';

interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  membership_type: string;
  status: string;
  start_date: string;
  expiry_date: string;
  expiry_status: string;
  days_until_expiry: number;
}

export default function MembershipExpiryMonitoring() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showExport, setShowExport] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [members, searchTerm, filterStatus]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expiring_memberships')
        .select('*')
        .order('days_until_expiry', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      showToast('Failed to load members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...members];

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.member_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.expiry_status === filterStatus);
    }

    setFilteredMembers(filtered);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const toggleSelectMember = (id: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMembers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedMembers.size === filteredMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(filteredMembers.map(m => m.id)));
    }
  };

  const sendBulkNotifications = async () => {
    if (selectedMembers.size === 0) {
      showToast('Please select at least one member', 'error');
      return;
    }

    setSending(true);
    try {
      const selectedMembersList = filteredMembers.filter(m => selectedMembers.has(m.id));

      for (const member of selectedMembersList) {
        const daysUntil = member.days_until_expiry;
        const emailSubject = daysUntil < 0
          ? `Your YCA Membership Has Expired | عضويتك في YCA قد انتهت`
          : `Reminder: Your YCA Membership Expires in ${daysUntil} Days | تذكير: عضويتك تنتهي خلال ${daysUntil} يوم`;

        const emailBody = `
Dear ${member.first_name} ${member.last_name},

${daysUntil < 0
  ? `Your YCA membership has expired on ${new Date(member.expiry_date).toLocaleDateString()}.`
  : `Your YCA membership will expire in ${daysUntil} days on ${new Date(member.expiry_date).toLocaleDateString()}.`
}

Member Number: ${member.member_number}

To continue enjoying our services, please renew your membership as soon as possible.

---

عزيزي ${member.first_name} ${member.last_name}،

${daysUntil < 0
  ? `لقد انتهت عضويتك في YCA بتاريخ ${new Date(member.expiry_date).toLocaleDateString('ar-SA')}.`
  : `ستنتهي عضويتك في YCA خلال ${daysUntil} يوم بتاريخ ${new Date(member.expiry_date).toLocaleDateString('ar-SA')}.`
}

رقم العضوية: ${member.member_number}

لمواصلة الاستفادة من خدماتنا، يرجى تجديد عضويتك في أقرب وقت ممكن.

Best regards,
Yemen Community Association
        `;

        await supabase.from('membership_notifications').insert({
          member_id: member.id,
          notification_type: 'manual',
          email_subject: emailSubject,
          email_body: emailBody,
          status: 'sent',
          metadata: {
            days_until_expiry: daysUntil,
            member_number: member.member_number,
            sent_by_admin: true,
          },
        });
      }

      showToast(`Notifications sent to ${selectedMembers.size} members`, 'success');
      setSelectedMembers(new Set());
    } catch (error) {
      console.error('Error sending notifications:', error);
      showToast('Failed to send notifications', 'error');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: typeof AlertCircle; label: string }> = {
      expired: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Expired' },
      urgent: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: '7 Days' },
      warning: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: '30 Days' },
      notice: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: '60 Days' },
      info: { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock, label: '90 Days' },
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle, label: 'Active' },
    };
    const c = config[status] || config.active;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const getCategoryCounts = () => {
    return {
      all: members.length,
      expired: members.filter(m => m.expiry_status === 'expired').length,
      urgent: members.filter(m => m.expiry_status === 'urgent').length,
      warning: members.filter(m => m.expiry_status === 'warning').length,
      notice: members.filter(m => m.expiry_status === 'notice').length,
      info: members.filter(m => m.expiry_status === 'info').length,
    };
  };

  const counts = getCategoryCounts();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Membership Expiry Monitor</h1>
          <p className="text-gray-600 mt-1">Track and manage expiring memberships</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{counts.all}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-600 mb-1">Expired</p>
            <p className="text-2xl font-bold text-red-700">{counts.expired}</p>
          </div>
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-600 mb-1">7 Days</p>
            <p className="text-2xl font-bold text-red-700">{counts.urgent}</p>
          </div>
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <p className="text-sm text-amber-600 mb-1">30 Days</p>
            <p className="text-2xl font-bold text-amber-700">{counts.warning}</p>
          </div>
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <p className="text-sm text-blue-600 mb-1">60 Days</p>
            <p className="text-2xl font-bold text-blue-700">{counts.notice}</p>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">90 Days</p>
            <p className="text-2xl font-bold text-gray-700">{counts.info}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by member number, name, or email..."
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
              <option value="all">All Statuses</option>
              <option value="expired">Expired</option>
              <option value="urgent">Urgent (7 Days)</option>
              <option value="warning">Warning (30 Days)</option>
              <option value="notice">Notice (60 Days)</option>
              <option value="info">Info (90 Days)</option>
            </select>
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={sendBulkNotifications}
              disabled={selectedMembers.size === 0 || sending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Reminders ({selectedMembers.size})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedMembers.size === filteredMembers.length && filteredMembers.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Member #</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expiry Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Days Left</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedMembers.has(member.id)}
                        onChange={() => toggleSelectMember(member.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.member_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.first_name} {member.last_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 capitalize">{member.membership_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(member.expiry_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={member.days_until_expiry < 0 ? 'text-red-600' : 'text-gray-900'}>
                        {member.days_until_expiry < 0 ? `Overdue ${Math.abs(member.days_until_expiry)}` : member.days_until_expiry}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(member.expiry_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No members found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showExport && (
        <ExportDialog
          data={filteredMembers}
          filename="membership-expiry-report"
          onClose={() => setShowExport(false)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </AdminLayout>
  );
}
