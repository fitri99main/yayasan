import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  moduleName?: string;
}

export default function ProtectedRoute({ children, moduleName }: ProtectedRouteProps) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || 'admin').toLowerCase().trim();

  // Admin and super admin bypass all checks
  if (role === 'admin' || role === 'super admin') {
    return <>{children}</>;
  }

  // If a specific module name is provided, check if user has permission
  if (moduleName) {
    if (!user.permissions || !user.permissions.includes(moduleName)) {
      // User doesn't have permission for this module, redirect to dashboard
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
