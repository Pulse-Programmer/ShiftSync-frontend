import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AdminDashboardPage } from './AdminDashboardPage';

/** Dashboard routes admin to global oversight, others to schedule */
export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') {
    return <AdminDashboardPage />;
  }

  return <Navigate to="/schedule" replace />;
}
