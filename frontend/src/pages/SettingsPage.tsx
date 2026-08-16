import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../utils/statusLabels';
import { API_URL } from '../services/api';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <PageHeader title="Configurações" description="Informações da sua conta e do sistema." />

      <Card className="mb-6 p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Minha conta</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Nome</dt>
            <dd className="font-medium text-slate-800">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">E-mail</dt>
            <dd className="font-medium text-slate-800">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Perfil</dt>
            <dd className="font-medium text-slate-800">{user ? USER_ROLE_LABELS[user.role] : ''}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-500">
          Para alterar dados de outros usuários ou seu perfil de acesso, peça a um administrador em{' '}
          <span className="font-medium">Usuários</span>.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Sobre o sistema</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Aplicação</dt>
            <dd className="font-medium text-slate-800">AutoControl — Oficina Mecânica e Funilaria</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">API</dt>
            <dd className="font-medium text-slate-800">{API_URL}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
