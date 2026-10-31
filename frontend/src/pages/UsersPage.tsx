import { useEffect, useState, type FormEvent } from 'react';
import { Plus, UserCog, Pencil, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { createUser, deactivateUser, listUsers, updateUser, type UserInput } from '../services/userService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

const EMPTY: UserInput = { name: '', email: '', password: '' };

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [values, setValues] = useState<UserInput>(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    setError('');
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os usuários.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setValues(EMPTY);
    setIsModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setValues({ name: user.name, email: user.email, active: user.active, password: '' });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...values };
      if (!payload.password) delete payload.password;

      if (editing) {
        await updateUser(editing.id, payload);
        showToast('Usuário atualizado.', 'success');
      } else {
        await createUser(payload);
        showToast('Usuário cadastrado.', 'success');
      }
      setIsModalOpen(false);
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível salvar o usuário.'), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      if (user.active) {
        await deactivateUser(user.id);
        showToast('Usuário desativado.', 'success');
      } else {
        await updateUser(user.id, { active: true });
        showToast('Usuário reativado.', 'success');
      }
      load();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível atualizar o usuário.'), 'error');
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Gestão"
        title="Usuários"
        description="Gerencie os funcionários com acesso ao sistema."
        action={
          <Button onClick={openCreate}>
            <Plus size={18} /> Novo usuário
          </Button>
        }
      />

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded border border-error/30 bg-error-container px-4 py-3 text-body-medium text-error">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="Nenhum usuário cadastrado" description="Cadastre os funcionários que terão acesso ao sistema." />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-body-medium">
              <thead className="border-b border-outline-variant text-label-medium text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">E-mail</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-high">
                    <td className="px-5 py-3 font-medium text-on-surface">{user.name}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          user.active
                            ? 'border-success/30 bg-success-container text-success'
                            : 'border-outline bg-surface-container-high text-on-surface-variant'
                        }
                      >
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          aria-label={`Editar ${user.name}`}
                          className="icon-button hover:text-primary"
                        >
                          <Pencil size={20} aria-hidden="true" />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            className="min-h-12 rounded-full px-3 text-label-large text-primary hover:bg-primary/10"
                          >
                            {user.active ? 'Desativar' : 'Reativar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title={editing ? 'Editar usuário' : 'Novo usuário'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nome completo"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          <Input
            label="E-mail"
            type="email"
            required
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          />
          <Input
            label={editing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
            type="password"
            required={!editing}
            value={values.password ?? ''}
            onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            hint="Mínimo de 6 caracteres."
          />
          <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
