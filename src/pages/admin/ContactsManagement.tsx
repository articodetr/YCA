import { useState, useEffect } from 'react';
import { Search, Loader2, Download, Eye, X, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface Toast { message: string; type: 'success' | 'error'; }

export default function ContactsManagement() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<Contact | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) { console.error('Error:', error); } finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('contact_submissions').update({ status }).eq('id', id);
      if (error) throw error;
      setToast({ message: `Marked as ${status}`, type: 'success' });
      await fetchData();
      if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const filtered = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || i.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Subject', 'Status', 'Date'];
    const rows = filtered.map(i => [i.name, i.email, i.phone || '', i.subject, i.status, new Date(i.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = { new: 'bg-blue-100 text-blue-700', read: 'bg-amber-100 text-amber-700', replied: 'bg-emerald-100 text-emerald-700' };
    return <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.new}`}>{status}</span>;
  };

  const newCount = items.filter(i => i.status === 'new').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Contact Messages
            {newCount > 0 && <span className="ml-2 inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-blue-600 text-white rounded-full">{newCount}</span>}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage contact form submissions and inquiries</p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search messages..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm">
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12"><p className="text-gray-500">No messages found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(i => (
                  <tr key={i.id} className={`hover:bg-gray-50 transition-colors ${i.status === 'new' ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-4 py-3.5 font-medium text-sm text-gray-900">{i.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{i.email}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[200px] truncate">{i.subject}</td>
                    <td className="px-4 py-3.5">{getStatusBadge(i.status)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{new Date(i.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button onClick={() => { setSelected(i); if (i.status === 'new') updateStatus(i.id, 'read'); }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-500">Showing {filtered.length} of {items.length} messages</div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selected.subject}</h2>
                <p className="text-sm text-gray-500 mt-1">{selected.name} - {selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getStatusBadge(selected.status)}
                <span className="text-sm text-gray-500">{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-gray-500 uppercase">Phone</label><p className="text-sm text-gray-900 mt-0.5">{selected.phone || '-'}</p></div>
                <div><label className="text-xs font-medium text-gray-500 uppercase">Email</label><p className="text-sm text-gray-900 mt-0.5">{selected.email}</p></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Message</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Update Status</label>
                <div className="flex gap-2">
                  {(['new', 'read', 'replied'] as const).map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors capitalize ${selected.status === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                      {s}
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
    </div>
  );
}
