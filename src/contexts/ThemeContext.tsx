import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  wallpaper: string | null;
  setWallpaper: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyWallpaper(url: string | null, theme: Theme) {
  const root = document.getElementById('root');
  if (!root) return;

  if (url) {
    document.body.style.backgroundImage = `url(${url})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundColor = 'transparent';
    const overlay = theme === 'dark' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.4)';
    root.style.background = overlay;
    root.style.backdropFilter = 'blur(6px)';
  } else {
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundPosition = '';
    document.body.style.backgroundAttachment = '';
    document.body.style.backgroundColor = '';
    root.style.background = '';
    root.style.backdropFilter = '';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('taksflow-theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  const [wallpaper, setWallpaperState] = useState<string | null>(() => {
    return localStorage.getItem('taksflow-wallpaper');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taksflow-theme', theme);
  }, [theme]);

  const setWallpaper = useCallback((url: string | null) => {
    setWallpaperState(url);
    if (url) {
      localStorage.setItem('taksflow-wallpaper', url);
    } else {
      localStorage.removeItem('taksflow-wallpaper');
    }
  }, []);

  useEffect(() => {
    applyWallpaper(wallpaper, theme);
  }, [wallpaper, theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, wallpaper, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
