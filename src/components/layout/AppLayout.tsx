import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const { user, loading } = useAuth();
  const { wallpaper } = useTheme();

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
    <div
      className={cn(
        'relative flex min-h-screen min-h-[100dvh]',
        wallpaper ? 'bg-transparent' : 'bg-dark-bg'
      )}
    >
      {wallpaper && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${wallpaper})` }}
        />
      )}
      <div className="fixed inset-0 -z-10 bg-dark-bg/40 backdrop-blur-sm" />
      <Sidebar />
      <main className="min-w-0 flex-1 lg:pb-16">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
