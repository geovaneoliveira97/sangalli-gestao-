import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV_GROUPS } from './navItems';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const content = (
    <nav aria-label="Navegação principal" className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-brand-500/40 bg-brand-950/40 font-mono text-xs font-bold text-brand-300">
          SG
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold leading-none text-white">Sangalli Gestão</p>
          <p className="mt-1 truncate text-[11px] leading-none text-slate-400">Oficina &amp; Funilaria</p>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded p-1.5 text-slate-400 hover:bg-white/5 lg:hidden"
          aria-label="Fechar menu"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex min-h-[38px] items-center gap-2.5 rounded border-l-2 px-2.5 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-brand-500 bg-white/[0.06] text-white'
                          : 'border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon size={16} aria-hidden="true" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      <div className="hidden w-60 shrink-0 bg-slate-950 lg:block">{content}</div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-slate-950 shadow-flyout">{content}</div>
        </div>
      )}
    </>
  );
}
