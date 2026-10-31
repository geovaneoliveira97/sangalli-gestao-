import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Package, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import {
  createPart,
  deletePart,
  listParts,
  updatePart,
  type PartInput,
} from '../services/catalogService';
import { getApiErrorMessage } from '../services/api';
import { useLowStock } from '../hooks/useLowStock';
import { useToast } from '../hooks/useToast';
import { formatCurrency } from '../utils/format';
import { stockBadgeClass } from '../utils/stock';
import type { Part } from '../types';

const EMPTY: PartInput = { name: '', code: '', manufacturer: '', price: 0, stock: 0, active: true };

export function PartsPage() {
  const { showToast } = useToast();
  const { refreshLowStock } = useLowStock();
  const canManage = true;

  const [parts, setParts] = useState<Part[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);
  const [values, setValues] = useState<PartInput>(EMPTY);
  const [deleting, setDeleting] = useState<Part | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load(searchTerm?: string) {
    setIsLoading(true);
    setError('');
    try {
      setParts(await listParts({ search: searchTerm }));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as peças.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditing(null);
    setValues(EMPTY);
    setIsModalOpen(true);
  }

  function openEdit(part: Part) {
    setEditing(part);
    // A API devolve campos Decimal como string, e a validação exige número.
    setValues({ ...part, price: Number(part.price) });
    setIsModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editing) {
        await updatePart(editing.id, values);
        showToast('Peça atualizada.', 'success');
      } else {
        await createPart(values);
        showToast('Peça cadastrada.', 'success');
      }
      setIsModalOpen(false);
      load(search || undefined);
      refreshLowStock();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível salvar a peça.'), 'error');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const result = await deletePart(deleting.id);
      const noun = result.usageCount === 1 ? 'ordem de serviço' : 'ordens de serviço';
      showToast(
        result.deleted
          ? 'Peça removida do catálogo.'
          : `Peça já usada em ${result.usageCount} ${noun}: mantida no histórico e apenas desativada.`,
        'success',
      );
      setDeleting(null);
      load(search || undefined);
      refreshLowStock();
    } catch (err) {
      showToast(getApiErrorMessage(err, 'Não foi possível remover a peça.'), 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Oficina"
        title="Peças"
        description="Estoque e catálogo de peças utilizadas nos serviços."
        action={
          canManage && (
            <Button onClick={openCreate}>
              <Plus size={18} /> Nova peça
            </Button>
          )
        }
      />

      <Card className="mb-4 max-w-sm p-3">
        <label htmlFor="part-search" className="sr-only">
          Buscar peças
        </label>
        <input
          id="part-search"
          type="search"
          placeholder="Buscar por nome ou código"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-12 w-full rounded-full bg-surface border border-outline px-4 py-2 text-body-large focus:border-primary"
        />
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
            <TableSkeleton rows={6} cols={5} />
          </div>
        ) : parts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhuma peça cadastrada"
            description="Cadastre as peças usadas na oficina para controlar estoque e agilizar orçamentos."
          />
        ) : (
          <div className="table-scroll">
            <table className="w-full text-left text-body-medium">
              <thead className="border-b border-outline-variant text-label-medium text-on-surface-variant">
                <tr>
                  <th scope="col" className="px-5 py-3">Nome</th>
                  <th scope="col" className="px-5 py-3">Código</th>
                  <th scope="col" className="px-5 py-3">Valor</th>
                  <th scope="col" className="px-5 py-3">Estoque</th>
                  {canManage && <th scope="col" className="px-5 py-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {parts.map((part) => (
                  <tr key={part.id} className="hover:bg-surface-container-high">
                    <td className="px-5 py-3">
                      <p className="font-medium text-on-surface">{part.name}</p>
                      {part.manufacturer && <p className="text-body-small text-on-surface-variant">{part.manufacturer}</p>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-body-small text-on-surface-variant">{part.code}</td>
                    <td className="tabular px-5 py-3 text-on-surface-variant">{formatCurrency(part.price)}</td>
                    <td className="px-5 py-3">
                      <Badge className={stockBadgeClass(part.stock)}>{part.stock} un.</Badge>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(part)}
                            aria-label={`Editar ${part.name}`}
                            className="icon-button hover:text-primary"
                          >
                            <Pencil size={20} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(part)}
                            aria-label={`Remover ${part.name}`}
                            className="icon-button hover:bg-error-container hover:text-error"
                          >
                            <Trash2 size={20} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal title={editing ? 'Editar peça' : 'Nova peça'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Nome da peça"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Código"
              required
              value={values.code}
              onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
            />
            <Input
              label="Fabricante"
              value={values.manufacturer ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, manufacturer: e.target.value }))}
            />
            <Input
              label="Valor (R$)"
              type="number"
              min={0}
              step="0.01"
              required
              value={values.price}
              onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
            />
            <Input
              label="Estoque"
              type="number"
              min={0}
              required
              value={values.stock}
              onChange={(e) => setValues((v) => ({ ...v, stock: Number(e.target.value) }))}
            />
          </div>
          <label className="flex min-h-12 items-center gap-3 text-body-medium text-on-surface">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(e) => setValues((v) => ({ ...v, active: e.target.checked }))}
              className="h-5 w-5 accent-primary"
            />
            Peça ativa
          </label>
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

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        title="Remover peça"
        message={`Remover "${deleting?.name}"? Se ela nunca foi usada em nenhuma ordem de serviço, será excluída definitivamente. Se já foi usada, será apenas desativada para preservar o histórico.`}
        confirmLabel="Remover"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
