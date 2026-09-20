import { useLayoutEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

export function AppLayout() {
  const { user, loading } = useAuth();
  const { wallpaper } = useTheme();
  const [wallpaperSize, setWallpaperSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!wallpaper) {
      setWallpaperSize(null);
      return;
    }

    let lastWidth = window.innerWidth;

    const applyFont = () => {
      const w = window.innerWidth;
      setWallpaperSize({ w, h: window.innerHeight + 64 });
      lastWidth = w;
    };

    applyFont();

    const onResize = () => {
      const w = window.innerWidth;
      if (Math.abs(w - lastWidth) > 5) applyFont();
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', applyFont);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', applyFont);
    };
  }, [wallpaper]);

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
    <div className={cn('flex min-h-screen min-h-[100dvh] flex-col bg-dark-bg')}>
      {wallpaper && wallpaperSize && (
        <div
          className="pointer-events-none fixed left-0 top-0 z-0 overflow-hidden"
          style={{ width: wallpaperSize.w, height: wallpaperSize.h }}
          aria-hidden="true"
        >
          <img
            src={wallpaper}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          />
        </div>
      )}
      <Sidebar />
      <main className="relative z-10 min-w-0 flex-1 lg:pb-16">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pb-24 lg:pb-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
