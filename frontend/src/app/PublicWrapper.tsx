import { Navigate } from 'react-router-dom';

interface PublicWrapperProps {
  children: React.ReactNode;
}

export default function PublicWrapper({ children }: PublicWrapperProps) {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
