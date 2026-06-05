import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Briefcase, CheckSquare, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/finance', icon: Wallet, label: 'Keuangan' },
  { to: '/jobs', icon: Briefcase, label: 'Lamaran' },
  { to: '/todos', icon: CheckSquare, label: 'Daftar Tugas' },
];

export function Sidebar() {
  const { signOut } = useAuth();

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-40 items-center justify-between border-b border-dark-border bg-dark-card/80 px-6 py-0 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            TF
          </div>
          <span className="text-sm font-semibold text-white">TaskFlow</span>
        </div>

        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-dark-muted hover:bg-dark-hover hover:text-white'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-accent-pink"
        >
          <LogOut size={16} />
          Keluar
        </button>
      </nav>

      {/* Mobile Floating Bottom Nav */}
      <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 lg:hidden">
        <div className="flex items-center gap-0.5 rounded-full border border-dark-border/50 bg-dark-card/70 px-2 py-1.5 shadow-xl backdrop-blur-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-center rounded-lg p-2 transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-dark-muted hover:text-white'
                )
              }
            >
              <item.icon size={20} />
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
