import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { WorkOrdersPage } from './pages/WorkOrdersPage';
import { NewWorkOrderPage } from './pages/NewWorkOrderPage';
import { WorkOrderDetailPage } from './pages/WorkOrderDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { PartsPage } from './pages/PartsPage';
import { FinancePage } from './pages/FinancePage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
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
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
