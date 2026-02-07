import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  X,
  Loader2,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Save,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

interface AdminPermission {
  admin_id: string;
  permission_key: string;
}

const ALL_PERMISSIONS = [
  { key: 'wakala.view', label: 'View Wakala Applications' },
  { key: 'wakala.edit', label: 'Edit Wakala Applications' },
  { key: 'availability.view', label: 'View Availability' },
  { key: 'availability.manage', label: 'Manage Availability' },
  { key: 'content.manage', label: 'Manage Content' },
  { key: 'admin.manage', label: 'Manage Admins' },
  { key: 'export.data', label: 'Export Data' },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const { adminData } = useAdminAuth();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const [{ data: adminData }, { data: permData }] = await Promise.all([
        supabase.from('admins').select('*').order('created_at', { ascending: true }),
        supabase.from('admin_permissions').select('admin_id, permission_key'),
      ]);
      setAdmins(adminData || []);
      setPermissions(permData || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdminPermissions = (adminId: string) => {
    return permissions.filter((p) => p.admin_id === adminId).map((p) => p.permission_key);
  };

  const togglePermission = async (adminId: string, permKey: string) => {
    const has = permissions.some((p) => p.admin_id === adminId && p.permission_key === permKey);
    try {
      if (has) {
        await supabase
          .from('admin_permissions')
          .delete()
          .eq('admin_id', adminId)
          .eq('permission_key', permKey);
      } else {
        await supabase
          .from('admin_permissions')
          .insert({ admin_id: adminId, permission_key: permKey });
      }
      const { data } = await supabase.from('admin_permissions').select('admin_id, permission_key');
      setPermissions(data || []);
    } catch (error) {
      console.error('Error toggling permission:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      super_admin: { bg: 'bg-red-100 border-red-200', text: 'text-red-800' },
      admin: { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-800' },
      editor: { bg: 'bg-gray-100 border-gray-200', text: 'text-gray-800' },
    };
    const c = config[role] || config.editor;
    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-7 h-7" />
            Admin Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage admin accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Login</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                          {admin.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{admin.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{admin.email}</td>
                    <td className="px-5 py-4">{getRoleBadge(admin.role)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${admin.is_active ? 'text-green-700' : 'text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {admin.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {admin.last_login_at
                        ? new Date(admin.last_login_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Never'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setShowPermissions(showPermissions === admin.id ? null : admin.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                          title="Permissions"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingAdmin(admin)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showPermissions && (
          <div className="border-t border-gray-200 p-5 bg-gray-50/50">
            <PermissionsPanel
              adminId={showPermissions}
              adminName={admins.find((a) => a.id === showPermissions)?.full_name || ''}
              adminRole={admins.find((a) => a.id === showPermissions)?.role || ''}
              currentPermissions={getAdminPermissions(showPermissions)}
              onToggle={togglePermission}
              onClose={() => setShowPermissions(null)}
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchAdmins}
        />
      )}

      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onUpdated={fetchAdmins}
        />
      )}
    </div>
  );
}

function PermissionsPanel({
  adminId,
  adminName,
  adminRole,
  currentPermissions,
  onToggle,
  onClose,
}: {
  adminId: string;
  adminName: string;
  adminRole: string;
  currentPermissions: string[];
  onToggle: (adminId: string, perm: string) => void;
  onClose: () => void;
}) {
  const isSuperAdmin = adminRole === 'super_admin';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-900">
          Permissions for {adminName}
          {isSuperAdmin && (
            <span className="ml-2 text-xs text-gray-500 font-normal">
              (Super admins have all permissions by default)
            </span>
          )}
        </h4>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {ALL_PERMISSIONS.map((perm) => {
          const hasIt = isSuperAdmin || currentPermissions.includes(perm.key);
          return (
            <button
              key={perm.key}
              onClick={() => !isSuperAdmin && onToggle(adminId, perm.key)}
              disabled={isSuperAdmin}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                hasIt
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              } ${isSuperAdmin ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center ${
                hasIt ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
              }`}>
                {hasIt && <span className="text-white text-[8px] font-bold">&#10003;</span>}
              </div>
              {perm.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admin`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create admin');
      }

      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Add New Admin</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Minimum 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditAdminModal({
  admin,
  onClose,
  onUpdated,
}: {
  admin: AdminUser;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [fullName, setFullName] = useState(admin.full_name);
  const [role, setRole] = useState(admin.role);
  const [isActive, setIsActive] = useState(admin.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admin`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          admin_id: admin.id,
          full_name: fullName.trim(),
          role,
          is_active: isActive,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update admin');
      }

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit Admin</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={admin.email}
              disabled
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">Account Status</p>
              <p className="text-xs text-gray-500">
                {isActive ? 'This admin can log in' : 'This admin cannot log in'}
              </p>
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                isActive ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
