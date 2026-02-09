import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import ManagementTable from './ManagementTable';
import CaseTimeline, { addSystemNote } from '../../components/admin/CaseTimeline';
import ExportDialog from '../../components/admin/ExportDialog';
import {
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  Pencil,
  Save,
  X,
  User,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { formatTimeRange } from '../../lib/booking-utils';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  myCases: number;
}

export default function WakalaManagement() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [admins, setAdmins] = useState<{ id: string; full_name: string }[]>([]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [filterMyCases, setFilterMyCases] = useState(false);
  const { user, adminData } = useAdminAuth();

  const stats: Stats = useMemo(() => {
    const s = { total: applications.length, pending: 0, approved: 0, rejected: 0, myCases: 0 };
    for (const app of applications) {
      if (app.status === 'pending' || app.status === 'submitted') s.pending++;
      else if (app.status === 'approved' || app.status === 'completed' || app.status === 'in_progress') s.approved++;
      else if (app.status === 'rejected') s.rejected++;
      if (app.assigned_admin_id === user?.id) s.myCases++;
    }
    return s;
  }, [applications, user]);

  const displayedApplications = useMemo(() => {
    if (!filterMyCases) return applications;
    return applications.filter((a) => a.assigned_admin_id === user?.id);
  }, [applications, filterMyCases, user]);

  useEffect(() => {
    fetchApplications();
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('admins')
      .select('id, full_name')
      .eq('is_active', true);
    setAdmins(data || []);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wakala_applications')
        .select('*')
        .neq('status', 'pending_payment')
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

      if (user) {
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        await addSystemNote(
          'wakala_application',
          id,
          user.id,
          `Status changed to "${statusLabel}" by ${adminData?.full_name || 'Admin'}`,
          'status_change'
        );
      }

      await fetchApplications();
      if (selectedApp?.id === id) {
        setSelectedApp((prev: any) => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const updateAssignment = async (appId: string, adminId: string | null) => {
    try {
      const { error } = await supabase
        .from('wakala_applications')
        .update({ assigned_admin_id: adminId })
        .eq('id', appId);

      if (error) throw error;

      if (user) {
        const assignedName = adminId
          ? admins.find((a) => a.id === adminId)?.full_name || 'Unknown'
          : 'Unassigned';
        await addSystemNote(
          'wakala_application',
          appId,
          user.id,
          `Case ${adminId ? `assigned to ${assignedName}` : 'unassigned'} by ${adminData?.full_name || 'Admin'}`,
          'assignment'
        );
      }

      await fetchApplications();
      if (selectedApp?.id === appId) {
        setSelectedApp((prev: any) => prev ? { ...prev, assigned_admin_id: adminId } : null);
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
    }
  };

  const startEditing = () => {
    if (!selectedApp) return;
    setEditData({
      full_name: selectedApp.full_name || '',
      applicant_name_ar: selectedApp.applicant_name_ar || '',
      phone: selectedApp.phone || '',
      email: selectedApp.email || '',
      nationality: selectedApp.nationality || '',
      passport_number: selectedApp.passport_number || '',
      date_of_birth: selectedApp.date_of_birth || '',
      agent_name: selectedApp.agent_name || '',
      wakala_type: selectedApp.wakala_type || '',
      wakala_format: selectedApp.wakala_format || '',
      special_requests: selectedApp.special_requests || '',
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!selectedApp || !user) return;
    setSavingEdit(true);
    try {
      const changes: string[] = [];
      for (const [key, val] of Object.entries(editData)) {
        const oldVal = selectedApp[key] || '';
        if (val !== oldVal) {
          changes.push(key.replace(/_/g, ' '));
        }
      }

      if (changes.length === 0) {
        setEditing(false);
        setSavingEdit(false);
        return;
      }

      const { error } = await supabase
        .from('wakala_applications')
        .update(editData)
        .eq('id', selectedApp.id);

      if (error) throw error;

      await addSystemNote(
        'wakala_application',
        selectedApp.id,
        user.id,
        `Data edited (${changes.join(', ')}) by ${adminData?.full_name || 'Admin'}`,
        'data_edit'
      );

      await fetchApplications();
      setSelectedApp((prev: any) => prev ? { ...prev, ...editData } : null);
      setEditing(false);
    } catch (error) {
      console.error('Error saving edit:', error);
      alert('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: typeof Clock; text: string }> = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: FileText, text: 'Submitted' },
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, text: 'Pending' },
      in_progress: { color: 'bg-sky-100 text-sky-800', icon: Clock, text: 'In Progress' },
      completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, text: 'Completed' },
      approved: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', icon: Clock, text: status };
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };

  const getAssignedName = (adminId: string | null) => {
    if (!adminId) return null;
    return admins.find((a) => a.id === adminId)?.full_name || null;
  };

  const columns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    { key: 'passport_number', label: 'Passport' },
    {
      key: 'service_type',
      label: 'Service Type',
      render: (value: string) => <span className="capitalize">{value?.replace(/_/g, ' ') || '-'}</span>,
    },
    {
      key: 'booking_date',
      label: 'Appointment Date',
      render: (value: string, row: any) => {
        if (!value) return '-';
        const date = new Date(value).toLocaleDateString();
        const time = row.start_time && row.end_time ? formatTimeRange(row.start_time, row.end_time) : '-';
        const duration = row.duration_minutes ? `${row.duration_minutes} min` : '';
        return (
          <div className="space-y-1">
            <div className="font-medium">{date}</div>
            <div className="text-xs text-gray-600">{time}</div>
            {duration && <div className="text-xs text-blue-600 font-medium">{duration}</div>}
          </div>
        );
      },
    },
    {
      key: 'assigned_admin_id',
      label: 'Assigned To',
      render: (value: string) => {
        const name = getAssignedName(value);
        return name ? (
          <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">{name}</span>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        );
      },
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

  const statCards = [
    {
      label: 'Total Applications',
      value: stats.total,
      icon: BarChart3,
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      valueColor: 'text-slate-900',
      onClick: () => setFilterMyCases(false),
      active: !filterMyCases,
    },
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    {
      label: 'My Cases',
      value: stats.myCases,
      icon: User,
      bg: filterMyCases ? 'bg-teal-100' : 'bg-teal-50',
      border: filterMyCases ? 'border-teal-400' : 'border-teal-200',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      valueColor: 'text-teal-700',
      onClick: () => setFilterMyCases(!filterMyCases),
      active: filterMyCases,
    },
  ];

  const editableField = (label: string, key: string, type = 'text') => {
    const value = editing ? editData[key] : selectedApp?.[key];
    return (
      <div>
        <label className="text-sm font-medium text-gray-500">{label}</label>
        {editing ? (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => setEditData((prev) => ({ ...prev, [key]: e.target.value }))}
            className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        ) : (
          <p className={`text-gray-900 ${key === 'applicant_name_ar' ? 'font-arabic' : ''}`} dir={key === 'applicant_name_ar' ? 'rtl' : 'ltr'}>
            {value || '-'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7" />
            Wakala Applications
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage Wakala service applications and appointments</p>
        </div>
        <button
          onClick={() => setShowExport(true)}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={card.onClick}
              className={`${card.bg} border ${card.border} rounded-xl p-4 transition-all duration-200 hover:shadow-sm ${
                card.onClick ? 'cursor-pointer' : ''
              } ${card.active ? 'ring-2 ring-offset-1 ring-teal-400' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.iconBg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
                {card.value > 0 && card.label === 'Pending Review' && (
                  <span className="flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-75" />
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

      <ManagementTable
        data={displayedApplications}
        columns={columns}
        loading={loading}
        onView={(item) => {
          setSelectedApp(item);
          setShowModal(true);
          setEditing(false);
        }}
        onRefresh={fetchApplications}
      />

      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <div className="flex items-center gap-2">
                {!editing ? (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={saveEdit}
                      disabled={savingEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => { setShowModal(false); setEditing(false); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Assigned To:</label>
                <select
                  value={selectedApp.assigned_admin_id || ''}
                  onChange={(e) => updateAssignment(selectedApp.id, e.target.value || null)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="">Unassigned</option>
                  {admins.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {editableField('Full Name', 'full_name')}
                {editableField('Name (Arabic)', 'applicant_name_ar')}
                {editableField('Passport Number', 'passport_number')}
                {editableField('Nationality', 'nationality')}
                {editableField('Date of Birth', 'date_of_birth', 'date')}
                {editableField('Phone', 'phone', 'tel')}
                {editableField('Email', 'email', 'email')}
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  {editing ? (
                    <select
                      value={editData.service_type || selectedApp.service_type || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, service_type: e.target.value }))}
                      className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="general_wakala">General Wakala</option>
                      <option value="property_wakala">Property Wakala</option>
                      <option value="court_wakala">Court Wakala</option>
                      <option value="business_wakala">Business Wakala</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 capitalize">{selectedApp.service_type?.replace(/_/g, ' ') || '-'}</p>
                  )}
                </div>
                {editableField('Agent Name', 'agent_name')}
                {editableField('Wakala Type', 'wakala_type')}
                {editableField('Wakala Format', 'wakala_format')}
                {selectedApp.booking_reference && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Booking Reference</label>
                    <p className="text-gray-900 font-mono text-sm">{selectedApp.booking_reference}</p>
                  </div>
                )}
              </div>

              {selectedApp.booking_date && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Appointment Details</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Date</label>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedApp.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Time</label>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApp.start_time && selectedApp.end_time
                          ? formatTimeRange(selectedApp.start_time, selectedApp.end_time)
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Duration</label>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedApp.duration_minutes ? `${selectedApp.duration_minutes} minutes` : '-'}
                      </p>
                    </div>
                  </div>
                  {selectedApp.cancelled_at && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <label className="text-xs font-medium text-red-600">Cancelled</label>
                      <p className="text-sm text-gray-700">
                        {new Date(selectedApp.cancelled_at).toLocaleString()}
                        {selectedApp.cancelled_by_user && ' (by user)'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!editing && selectedApp.special_requests && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Requests</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedApp.special_requests}</p>
                </div>
              )}
              {editing && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Special Requests</label>
                  <textarea
                    value={editData.special_requests || ''}
                    onChange={(e) => setEditData((prev) => ({ ...prev, special_requests: e.target.value }))}
                    rows={3}
                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Passport Documents</label>
                <div className="space-y-3">
                  {selectedApp.applicant_passport_url || selectedApp.attorney_passport_url ? (
                    <>
                      {selectedApp.applicant_passport_url && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-600">Applicant Passport / جواز الموكل</p>
                          <div className="flex items-center gap-3">
                            <img
                              src={selectedApp.applicant_passport_url}
                              alt="Applicant Passport"
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-colors"
                              onClick={() => window.open(selectedApp.applicant_passport_url, '_blank')}
                            />
                            <div className="flex flex-col gap-2">
                              <a
                                href={selectedApp.applicant_passport_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Full Size
                              </a>
                              <a
                                href={selectedApp.applicant_passport_url}
                                download
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedApp.attorney_passport_url && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-600">Attorney Passport / جواز الوكيل</p>
                          <div className="flex items-center gap-3">
                            <img
                              src={selectedApp.attorney_passport_url}
                              alt="Attorney Passport"
                              className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-emerald-500 transition-colors"
                              onClick={() => window.open(selectedApp.attorney_passport_url, '_blank')}
                            />
                            <div className="flex flex-col gap-2">
                              <a
                                href={selectedApp.attorney_passport_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Full Size
                              </a>
                              <a
                                href={selectedApp.attorney_passport_url}
                                download
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>No documents uploaded</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">Status</label>
                {getStatusBadge(selectedApp.status)}
              </div>

              <CaseTimeline entityType="wakala_application" entityId={selectedApp.id} />

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                {(selectedApp.status === 'pending' || selectedApp.status === 'submitted') && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'in_progress')}
                      className="flex-1 bg-sky-600 hover:bg-sky-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-5 h-5" />
                      In Progress
                    </button>
                    <button
                      onClick={() => updateStatus(selectedApp.id, 'completed')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Complete
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
                {selectedApp.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'completed')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Complete
                  </button>
                )}
                {!['pending', 'submitted'].includes(selectedApp.status) && (
                  <button
                    onClick={() => updateStatus(selectedApp.id, 'submitted')}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Clock className="w-5 h-5" />
                    Reset to Submitted
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        entityType="wakala"
        admins={admins}
      />
    </div>
  );
}
