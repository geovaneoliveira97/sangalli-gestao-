import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users as UsersIcon, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ClientForm } from '../components/forms/ClientForm';
import {
  createClient,
  deleteClient,
  listClients,
  updateClient,
  type ClientInput,
} from '../services/clientService';
import { getApiErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import type { Client } from '../types';

export function ClientsPage() {
  const { showToast } = useToast();

  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async (searchTerm?: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listClients(searchTerm);
      setClients(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os clientes.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditingClient(null);
    setIsModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setIsModalOpen(true);
  }

  async function handleSubmit(values: ClientInput) {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, values);
        showToast('Cliente atualizado com sucesso.', 'success');
      } else {
        await createClient(values);
        showToast('Cliente cadastrado com sucesso.', 'success');
      }
      setIsModalOpen(false);
      load(search || undefined);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível salvar o cliente.'), 'error');
    }
  }

  async function handleDelete() {
    if (!deletingClient) return;
    setIsDeleting(true);
    try {
      await deleteClient(deletingClient.id);
      showToast('Cliente removido.', 'success');
      setDeletingClient(null);
      load(search || undefined);
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível remover o cliente.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Operação"
        title="Clientes"
        description="Cadastro e gerenciamento dos clientes da oficina."
        action={
          <Button onClick={openCreate}>
            <Plus size={18} /> Novo cliente
          </Button>
        }
      />

      <Card className="mb-4 max-w-sm p-3">
        <label htmlFor="client-search" className="sr-only">
          Buscar clientes
        </label>
        <div className="relative">
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
          <input
            id="client-search"
            type="search"
            placeholder="Buscar por nome ou telefone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-h-12 w-full rounded-full border border-outline bg-surface py-2 pl-12 pr-4 text-body-large focus:border-primary"
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="mb-4 flex items-center gap-2 rounded border border-error/30 bg-error-container px-4 py-3 text-body-medium text-error">
          <AlertCircle size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      <Card>
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={6} cols={4} />
          </div>
        ) : clients.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Nenhum cliente encontrado"
            description="Cadastre o primeiro cliente da oficina para começar."
            action={
              <Button onClick={openCreate}>
                <Plus size={18} /> Novo cliente
              </Button>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-body-medium">
              <thead className="border-b border-outline-variant text-label-medium text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">Telefone</th>
                  <th scope="col" className="px-5 py-3">Veículos</th>
                  <th scope="col" className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-surface-container-high">
                    <td className="px-5 py-3 font-medium text-on-surface">
                      <Link to={`/clientes/${client.id}`} className="touch-target hover:underline">
                        {client.name}
                      </Link>
                    </td>
                    <td className="tabular px-5 py-3 text-on-surface-variant">{client.phone}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{client._count?.vehicles ?? 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(client)}
                          aria-label={`Editar ${client.name}`}
                          className="icon-button hover:text-primary"
                        >
                          <Pencil size={20} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingClient(client)}
                          aria-label={`Remover ${client.name}`}
                          className="icon-button hover:bg-error-container hover:text-error"
                        >
                          <Trash2 size={20} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        title={editingClient ? 'Editar cliente' : 'Novo cliente'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <ClientForm
          initialValues={editingClient ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingClient)}
        title="Remover cliente"
        message={`Tem certeza que deseja remover "${deletingClient?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingClient(null)}
      />
    </div>
  );
}
