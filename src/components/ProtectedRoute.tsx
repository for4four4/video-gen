// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FILE: src/components/ProtectedRoute.tsx                                ║
// ╚══════════════════════════════════════════════════════════════════════════╝
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/auth';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
