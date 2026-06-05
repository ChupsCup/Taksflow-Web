import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  wallpaper: string | null;
  setWallpaper: (url: string | null) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

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

  const setWallpaper = (url: string | null) => {
    setWallpaperState(url);
    if (url) {
      localStorage.setItem('taksflow-wallpaper', url);
    } else {
      localStorage.removeItem('taksflow-wallpaper');
    }
  };

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
