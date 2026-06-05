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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-dark-border lg:bg-dark-card">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 border-b border-dark-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            TF
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">TaskFlow</h1>
            <p className="text-xs text-dark-muted">Atur semuanya</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-dark-muted hover:bg-dark-hover hover:text-white'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-dark-border px-4 py-4">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-dark-muted transition-colors hover:bg-dark-hover hover:text-accent-pink"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Floating Bottom Nav */}
      <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 lg:hidden">
        <div className="flex items-center gap-1 rounded-2xl border border-dark-border bg-dark-card px-2 py-1.5 shadow-xl">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[56px]',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-dark-muted hover:text-white'
                )
              }
            >
              <item.icon size={18} />
              <span className="leading-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}