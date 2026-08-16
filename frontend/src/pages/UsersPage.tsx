import { useEffect, useState, type FormEvent } from 'react';
import { Plus, UserCog, Pencil, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { createUser, deactivateUser, listUsers, updateUser, type UserInput } from '../services/userService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../utils/statusLabels';
import type { User } from '../types';

const EMPTY: UserInput = { name: '', email: '', password: '', role: 'ATENDENTE' };

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
    setValues({ name: user.name, email: user.email, role: user.role, active: user.active, password: '' });
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
        title="Usuários"
        description="Gerencie os funcionários com acesso ao sistema."
        action={
          <Button onClick={openCreate}>
            <Plus size={18} /> Novo usuário
          </Button>
        }
      />

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
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
          <EmptyState icon={UserCog} title="Nenhum usuário cadastrado" />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">E-mail</th>
                  <th scope="col" className="px-5 py-3">Perfil</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{user.name}</td>
                    <td className="px-5 py-3 text-slate-600">{user.email}</td>
                    <td className="px-5 py-3 text-slate-600">{USER_ROLE_LABELS[user.role]}</td>
                    <td className="px-5 py-3">
                      <Badge
                        className={
                          user.active
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-300 bg-slate-100 text-slate-600'
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
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700"
                        >
                          <Pencil size={16} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleActive(user)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
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
          <Select
            label="Perfil"
            value={values.role}
            onChange={(e) => setValues((v) => ({ ...v, role: e.target.value as User['role'] }))}
          >
            {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
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
