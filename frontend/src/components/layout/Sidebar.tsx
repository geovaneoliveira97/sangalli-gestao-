import { NavLink } from 'react-router-dom';
import { Wrench, X } from 'lucide-react';
import { NAV_ITEMS } from './navItems';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const { user, hasRole } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && hasRole(...item.roles)));

  const content = (
    <nav aria-label="Navegação principal" className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Wrench size={20} aria-hidden="true" />
        </div>
        <span className="text-lg font-bold text-white">AutoControl</span>
        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 lg:hidden"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      <div className="hidden w-64 shrink-0 bg-slate-950 lg:block">{content}</div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-slate-950 shadow-xl">{content}</div>
        </div>
      )}
    </>
  );
}
