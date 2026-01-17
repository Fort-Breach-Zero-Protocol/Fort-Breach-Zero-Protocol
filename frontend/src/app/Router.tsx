import { useState } from 'react';
import Signup from '@/app/Signup';
import Login from '@/app/Login';

export default function Router() {
  const [currentPage, setCurrentPage] = useState<'signup' | 'login'>('signup');

  return (
    <>
      {currentPage === 'signup' && <Signup onNavigateToLogin={() => setCurrentPage('login')} />}
      {currentPage === 'login' && <Login onNavigateToSignup={() => setCurrentPage('signup')} />}
    </>
  );
}
