import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Briefcase, CheckSquare } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/finance', icon: Wallet, label: 'Keuangan' },
  { to: '/jobs', icon: Briefcase, label: 'Lamaran' },
  { to: '/todos', icon: CheckSquare, label: 'Daftar Tugas' },
];

export function Sidebar() {
  return (
    <>
      {/* Desktop Bottom Navbar */}
      <nav className="hidden lg:flex fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
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
