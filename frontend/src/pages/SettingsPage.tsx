import { PageHeader } from '../components/ui/PageHeader';
import { SectionCard } from '../components/ui/SectionCard';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../utils/statusLabels';
import { API_URL } from '../services/api';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow="Gestão" title="Configurações" description="Informações da sua conta e do sistema." />

      <SectionCard className="mb-5" eyebrow="Acesso" title="Minha conta">
        <dl className="space-y-2 text-body-medium">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Nome</dt>
            <dd className="font-medium text-on-surface">{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">E-mail</dt>
            <dd className="font-mono text-body-small font-medium text-on-surface">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Perfil</dt>
            <dd className="font-medium text-on-surface">{user ? USER_ROLE_LABELS[user.role] : ''}</dd>
          </div>
        </dl>
        <p className="mt-4 text-body-small text-on-surface-variant">
          Para alterar dados de outros usuários ou seu perfil de acesso, peça a um administrador em{' '}
          <span className="font-medium">Usuários</span>.
        </p>
      </SectionCard>

      <SectionCard eyebrow="Ambiente" title="Sobre o sistema">
        <dl className="space-y-2 text-body-medium">
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">Aplicação</dt>
            <dd className="font-medium text-on-surface">Sangalli Gestão — Oficina Mecânica e Funilaria</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-surface-variant">API</dt>
            <dd className="font-mono text-body-small font-medium text-on-surface">{API_URL}</dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  );
}
