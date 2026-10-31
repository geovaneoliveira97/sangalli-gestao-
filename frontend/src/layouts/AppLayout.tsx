import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';
import { PageLoader } from '../components/ui/PageLoader';
import { LowStockProvider } from '../contexts/LowStockContext';

export function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <LowStockProvider>
      <div className="flex min-h-screen bg-surface">
        <a href="#main-content" className="skip-link">
          Pular para o conteúdo principal
        </a>
        <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar onOpenMobileMenu={() => setIsMobileOpen(true)} />
          <main id="main-content" className="flex-1 p-4 sm:p-6">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </LowStockProvider>
  );
}
