import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Bell } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clienti', icon: Users, label: 'Clienti' },
  { to: '/sopralluoghi', icon: ClipboardList, label: 'Sopralluoghi' },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-brand-darker shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-brand-dark/50">
        <div className="font-serif text-white font-semibold text-lg leading-tight">
          SICUR.A.L.A.
        </div>
        <div className="text-brand-light/70 text-xs mt-0.5">SicurApp Sopralluoghi</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-brand-dark/50">
        <p className="text-white/40 text-xs">v1.0.0</p>
      </div>
    </aside>
  );
}
