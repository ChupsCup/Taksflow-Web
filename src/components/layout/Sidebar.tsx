import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Briefcase, CheckSquare, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SettingsModal } from './SettingsModal';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/finance', icon: Wallet, label: 'Keuangan' },
  { to: '/jobs', icon: Briefcase, label: 'Lamaran' },
  { to: '/todos', icon: CheckSquare, label: 'Daftar Tugas' },
];

function NavPill({ isDesktop }: { isDesktop: boolean }) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <nav className={`fixed bottom-5 left-1/2 z-40 -translate-x-1/2 ${isDesktop ? 'hidden lg:flex' : 'lg:hidden'}`}>
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
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-center rounded-lg p-2 text-dark-muted transition-colors hover:text-white"
            title="Pengaturan"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export function Sidebar() {
  return (
    <>
      <NavPill isDesktop />
      <NavPill isDesktop={false} />
    </>
  );
}
