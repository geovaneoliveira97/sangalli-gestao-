import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export function Modal({ title, isOpen, onClose, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // A maioria das telas passa `onClose={() => setIsModalOpen(false)}` — uma
  // função nova a cada renderização. Guardamos a versão mais recente numa
  // ref para poder usá-la sem colocar `onClose` nas dependências do efeito
  // abaixo: se ele rodasse a cada tecla digitada em algum campo do formulário
  // (o que muda o estado do componente pai e recria `onClose`), o
  // `dialogRef.current?.focus()` tiraria o foco do campo a cada letra.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCloseRef.current();
    }

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`max-h-[90vh] w-full ${SIZE_CLASSES[size]} overflow-y-auto rounded-xl bg-surface shadow-flyout focus:outline-none`}
      >
        <div className="flex items-center justify-between gap-2 pb-2 pl-6 pr-2 pt-4">
          <h2 id="modal-title" className="text-headline-small text-on-surface">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="icon-button"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
