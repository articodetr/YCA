import { ShieldAlert, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Access restricted</h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your admin account is active, but no sections have been enabled for you yet. Please contact the Super Admin
            to grant you access to the required sections.
          </p>
          <button
            onClick={handleSignOut}
            className="mt-4 inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
