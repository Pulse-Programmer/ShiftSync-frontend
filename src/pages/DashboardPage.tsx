import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Dashboard redirects to the primary view per role */
export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Everyone lands on the schedule view — it adapts per role
  return <Navigate to="/schedule" replace />;
}
