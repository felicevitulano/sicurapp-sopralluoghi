import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Users, ClipboardList, Plus } from 'lucide-react';
import clsx from 'clsx';

export function TopBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-serif font-semibold text-brand text-base">SICUR.A.L.A.</span>
        </div>

        {/* Desktop: breadcrumb area (empty, used by pages) */}
        <div className="hidden md:block" id="topbar-breadcrumb" />

        {/* Actions */}
        <button
          onClick={() => navigate('/sopralluoghi/nuovo')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nuovo Sopralluogo</span>
        </button>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-darker px-2 py-3 space-y-1">
          {[
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/clienti', icon: Users, label: 'Clienti' },
            { to: '/sopralluoghi', icon: ClipboardList, label: 'Sopralluoghi' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                  isActive ? 'bg-white/15 text-white' : 'text-white/70'
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}
