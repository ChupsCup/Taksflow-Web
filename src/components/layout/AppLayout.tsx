import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

export function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-dark-bg">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-dark-bg">
      <Sidebar />
      <main className="min-w-0 flex-1 lg:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
