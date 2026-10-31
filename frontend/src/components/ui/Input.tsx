import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  FIELD_LABEL_RESTING,
  FIELD_PLACEHOLDER_CLASS,
  fieldControlClass,
  fieldLabelClass,
} from './fieldStyles';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Ícone à esquerda do texto. */
  icon?: LucideIcon;
  /** Ação à direita do texto (ex.: mostrar/ocultar senha). */
  trailing?: ReactNode;
}

// Tipos em que o navegador sempre mostra uma máscara ou um controle próprio:
// o rótulo não pode pousar dentro do campo, ou ficaria sobre ela.
const ALWAYS_RAISED_LABEL_TYPES = ['date', 'datetime-local', 'month', 'time', 'file'];

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, id, className = '', required, type, placeholder, icon: Icon, trailing, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const canRest = !ALWAYS_RAISED_LABEL_TYPES.includes(type ?? '');

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          {Icon && (
            <Icon
              size={20}
              className="pointer-events-none absolute left-3 top-4 text-on-surface-variant"
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            required={required}
            placeholder={placeholder || ' '}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`h-14 ${Icon ? 'pl-11' : 'pl-4'} ${trailing ? 'pr-14' : 'pr-4'} ${fieldControlClass(Boolean(error))} ${FIELD_PLACEHOLDER_CLASS} ${className}`}
            {...props}
          />
          <label
            htmlFor={inputId}
            className={`${fieldLabelClass(Boolean(error))} ${canRest ? FIELD_LABEL_RESTING : ''} ${Icon && canRest ? 'peer-placeholder-shown:left-10 peer-focus:left-3' : ''}`}
          >
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </label>
          {trailing && <div className="absolute right-1 top-1">{trailing}</div>}
        </div>
        {hint && !error && (
          <p id={hintId} className="px-4 text-body-small text-on-surface-variant">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="px-4 text-body-small text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';
