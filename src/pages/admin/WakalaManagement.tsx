import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import ManagementTable from './ManagementTable';
import { FileText, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function WakalaManagement() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wakala_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('wakala_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchApplications();
      setShowModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const downloadDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('wakala-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'passport_number',
      label: 'Passport',
    },
    {
      key: 'service_type',
      label: 'Service Type',
      render: (value: string) => (
        <span className="capitalize">{value.replace(/_/g, ' ')}</span>
      ),
    },
    {
      key: 'requested_date',
      label: 'Appointment Date',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          value === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Applied',
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Wakala Applications
        </h1>
        <p className="text-gray-600 mt-2">Manage Wakala service applications</p>
      </div>

      <ManagementTable
        data={applications}
        columns={columns}
        loading={loading}
        onView={(item) => {
          setSelectedApp(item);
          setShowModal(true);
        }}
        onRefresh={fetchApplications}
      />

      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900">{selectedApp.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Passport Number</label>
                  <p className="text-gray-900">{selectedApp.passport_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nationality</label>
                  <p className="text-gray-900">{selectedApp.nationality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{new Date(selectedApp.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900">{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="text-gray-900 capitalize">{selectedApp.service_type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Date</label>
                  <p className="text-gray-900">{new Date(selectedApp.requested_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedApp.special_requests && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Requests</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApp.special_requests}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Passport Documents</label>
                <div className="space-y-2">
                  {selectedApp.passport_copies && selectedApp.passport_copies.length > 0 ? (
                    selectedApp.passport_copies.map((filePath: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => downloadDocument(filePath)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg w-full text-left transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-900">Document {index + 1}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No documents uploaded</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                {getStatusBadge(selectedApp.status)}
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {selectedApp.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
                {selectedApp.status !== 'pending' && (
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'pending')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
