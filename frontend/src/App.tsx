import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { FullScreenLoader } from './components/ui/PageLoader';
import { LoginPage } from './pages/LoginPage';

// Cada página vira um pedaço (chunk) próprio de JavaScript, baixado só quando
// o usuário visita aquela rota — em vez de tudo (incluindo bibliotecas
// pesadas como a de gráficos, usada só no Dashboard/Financeiro/Relatórios)
// ir junto no primeiro carregamento do site.
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then((m) => ({ default: m.ClientsPage })));
const ClientDetailPage = lazy(() =>
  import('./pages/ClientDetailPage').then((m) => ({ default: m.ClientDetailPage })),
);
const VehiclesPage = lazy(() => import('./pages/VehiclesPage').then((m) => ({ default: m.VehiclesPage })));
const VehicleDetailPage = lazy(() =>
  import('./pages/VehicleDetailPage').then((m) => ({ default: m.VehicleDetailPage })),
);
const WorkOrdersPage = lazy(() => import('./pages/WorkOrdersPage').then((m) => ({ default: m.WorkOrdersPage })));
const NewWorkOrderPage = lazy(() =>
  import('./pages/NewWorkOrderPage').then((m) => ({ default: m.NewWorkOrderPage })),
);
const WorkOrderDetailPage = lazy(() =>
  import('./pages/WorkOrderDetailPage').then((m) => ({ default: m.WorkOrderDetailPage })),
);
const ServicesPage = lazy(() => import('./pages/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const PartsPage = lazy(() => import('./pages/PartsPage').then((m) => ({ default: m.PartsPage })));
const FinancePage = lazy(() => import('./pages/FinancePage').then((m) => ({ default: m.FinancePage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const PublicTrackingPage = lazy(() =>
  import('./pages/PublicTrackingPage').then((m) => ({ default: m.PublicTrackingPage })),
);
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<FullScreenLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/acompanhar/:token" element={<PublicTrackingPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />

                  <Route path="/clientes" element={<ClientsPage />} />
                  <Route path="/clientes/:id" element={<ClientDetailPage />} />
                  <Route path="/veiculos" element={<VehiclesPage />} />
                  <Route path="/veiculos/:id" element={<VehicleDetailPage />} />
                  <Route path="/financeiro" element={<FinancePage />} />
                  <Route path="/relatorios" element={<ReportsPage />} />

                  <Route path="/ordens" element={<WorkOrdersPage />} />
                  <Route path="/ordens/:id" element={<WorkOrderDetailPage />} />
                  <Route path="/ordens/nova" element={<NewWorkOrderPage />} />

                  <Route path="/servicos" element={<ServicesPage />} />
                  <Route path="/pecas" element={<PartsPage />} />
                  <Route path="/configuracoes" element={<SettingsPage />} />

                  <Route path="/usuarios" element={<UsersPage />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
