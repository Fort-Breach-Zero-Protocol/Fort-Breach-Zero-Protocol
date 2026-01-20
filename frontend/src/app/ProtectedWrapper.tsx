import { Navigate } from 'react-router-dom';

interface ProtectedWrapperProps {
  children: React.ReactNode;
}

export default function ProtectedWrapper({ children }: ProtectedWrapperProps) {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
