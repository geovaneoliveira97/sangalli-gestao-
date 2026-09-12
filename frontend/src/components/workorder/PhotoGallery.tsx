import { Camera, Trash2 } from 'lucide-react';
import { PHOTO_CATEGORY_LABELS } from '../../utils/statusLabels';
import type { PhotoCategory, WorkOrderPhoto } from '../../types';

interface PhotoGalleryProps {
  photos: WorkOrderPhoto[];
  canManage: boolean;
  onUploadClick: () => void;
  onDelete: (photoId: string) => void;
}

const CATEGORIES: PhotoCategory[] = ['ENTRADA', 'DURANTE', 'FINALIZACAO'];

export function PhotoGallery({ photos, canManage, onDelete }: PhotoGalleryProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded border border-dashed border-slate-300 py-10 text-center">
        <Camera size={28} className="mb-2 text-slate-300" aria-hidden="true" />
        <p className="text-sm text-slate-500">Nenhuma foto adicionada ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {CATEGORIES.map((category) => {
        const items = photos.filter((p) => p.category === category);
        if (items.length === 0) return null;
        return (
          <div key={category}>
            <p className="eyebrow mb-2">{PHOTO_CATEGORY_LABELS[category]}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {items.map((photo) => (
                <li key={photo.id} className="group relative overflow-hidden rounded border border-slate-200">
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
                      className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-status-danger opacity-0 shadow transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
  );
}
