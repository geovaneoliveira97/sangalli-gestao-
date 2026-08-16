import { Camera, Trash2, Plus } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { PHOTO_CATEGORY_LABELS } from '../../utils/statusLabels';
import type { PhotoCategory, WorkOrderPhoto } from '../../types';

interface PhotoGalleryProps {
  photos: WorkOrderPhoto[];
  canManage: boolean;
  onUploadClick: () => void;
  onDelete: (photoId: string) => void;
}

const CATEGORIES: PhotoCategory[] = ['ENTRADA', 'DURANTE', 'FINALIZACAO'];

export function PhotoGallery({ photos, canManage, onUploadClick, onDelete }: PhotoGalleryProps) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Fotos do veículo</h2>
        {canManage && (
          <Button size="sm" onClick={onUploadClick}>
            <Plus size={16} /> Adicionar foto
          </Button>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-10 text-center">
          <Camera size={32} className="mb-2 text-slate-300" aria-hidden="true" />
          <p className="text-sm text-slate-500">Nenhuma foto adicionada ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((category) => {
            const items = photos.filter((p) => p.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="mb-2 text-sm font-semibold text-slate-700">{PHOTO_CATEGORY_LABELS[category]}</h3>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {items.map((photo) => (
                    <li key={photo.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
                      <img
                        src={photo.url}
                        alt={photo.caption || `Foto da categoria ${PHOTO_CATEGORY_LABELS[category]}`}
                        className="aspect-square w-full object-cover"
                        loading="lazy"
                      />
                      {photo.caption && (
                        <p className="truncate bg-white px-2 py-1 text-xs text-slate-600">{photo.caption}</p>
                      )}
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => onDelete(photo.id)}
                          aria-label="Excluir foto"
                          className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-red-600 opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
