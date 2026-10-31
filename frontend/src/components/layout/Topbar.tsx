import { LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LowStockBell } from './LowStockBell';
import { useAuth } from '../../hooks/useAuth';
import { USER_ROLE_LABELS } from '../../utils/statusLabels';

export function Topbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = (user?.name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-outline-variant bg-surface px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="icon-button lg:hidden"
        aria-label="Abrir menu de navegação"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <LowStockBell />
        <div className="flex items-center gap-3 border-r border-outline-variant pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-label-medium text-on-primary-container">
            {initials || '—'}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-label-large text-on-surface">{user?.name}</p>
            <p className="text-body-small text-on-surface-variant">{user ? USER_ROLE_LABELS[user.role] : ''}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="touch-target flex min-h-10 items-center gap-2 rounded-full border border-outline px-4 text-label-large text-primary transition-colors hover:bg-primary/10"
        >
          <LogOut size={16} aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">Sair</span>
        </button>
      </div>
    </header>
  );
}
