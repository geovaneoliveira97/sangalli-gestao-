import { useState, type ChangeEvent } from 'react';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PHOTO_CATEGORY_LABELS } from '../../utils/statusLabels';
import type { PhotoCategory } from '../../types';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, category: PhotoCategory, caption?: string) => Promise<void>;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function PhotoUploadModal({ isOpen, onClose, onUpload }: PhotoUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<PhotoCategory>('ENTRADA');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    setError('');
    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError('Formato inválido. Envie uma imagem JPG, PNG ou WEBP.');
      setFile(null);
      return;
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`O arquivo excede o tamanho máximo de ${MAX_SIZE_MB}MB.`);
      setFile(null);
      return;
    }
    setFile(selected);
  }

  async function handleSubmit() {
    if (!file) {
      setError('Selecione uma imagem para enviar.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onUpload(file, category, caption || undefined);
      setFile(null);
      setCaption('');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Adicionar foto" isOpen={isOpen} onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="photo-file" className="text-body-medium font-medium text-on-surface">
            Arquivo de imagem <span className="text-error">*</span>
          </label>
          <input
            id="photo-file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            aria-describedby={error ? 'photo-file-error' : 'photo-file-hint'}
            className="text-body-medium file:mr-3 file:min-h-10 file:rounded-full file:border-0 file:bg-primary-container file:px-4 file:text-label-large file:text-on-primary-container"
          />
          <p id="photo-file-hint" className="text-body-small text-on-surface-variant">
            JPG, PNG ou WEBP, até {MAX_SIZE_MB}MB.
          </p>
          {error && (
            <p id="photo-file-error" role="alert" className="text-body-small font-medium text-error">
              {error}
            </p>
          )}
        </div>

        <Select label="Categoria" value={category} onChange={(e) => setCategory(e.target.value as PhotoCategory)}>
          {Object.entries(PHOTO_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Input label="Legenda (opcional)" value={caption} onChange={(e) => setCaption(e.target.value)} />

        <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} isLoading={isSubmitting}>
            Enviar foto
          </Button>
        </div>
      </div>
    </Modal>
  );
}
