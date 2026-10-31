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
      <div className="flex items-center gap-3 px-4 py-4">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container font-mono text-label-large text-on-primary-container"
        >
          SG
        </div>
        <div className="min-w-0">
          <p className="truncate text-title-small text-on-surface">Sangalli Gestão</p>
          <p className="truncate text-body-small text-on-surface-variant">Oficina &amp; Funilaria</p>
        </div>
        <button type="button" onClick={onCloseMobile} className="icon-button ml-auto lg:hidden" aria-label="Fechar menu">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-4 pb-1 text-label-medium text-on-surface-variant">{group.label}</p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex min-h-12 items-center gap-3 rounded-full px-4 text-label-large transition-colors ${
                        isActive
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'text-on-surface-variant hover:bg-on-surface/10'
                      }`
                    }
                  >
                    <item.icon size={20} aria-hidden="true" />
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
      <div className="sticky top-0 hidden h-screen w-64 shrink-0 bg-surface-container lg:block">{content}</div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-on-surface/40" onClick={onCloseMobile} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-72 rounded-r-lg bg-surface-container shadow-flyout">{content}</div>
        </div>
      )}
    </>
  );
}
