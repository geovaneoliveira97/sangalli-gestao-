import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import {
  FIELD_LABEL_RESTING,
  FIELD_PLACEHOLDER_CLASS,
  fieldControlClass,
  fieldLabelClass,
} from './fieldStyles';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = '', required, placeholder, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            required={required}
            placeholder={placeholder || ' '}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            rows={3}
            className={`block px-4 py-4 ${fieldControlClass(Boolean(error))} ${FIELD_PLACEHOLDER_CLASS} ${className}`}
            {...props}
          />
          <label htmlFor={textareaId} className={`${fieldLabelClass(Boolean(error))} ${FIELD_LABEL_RESTING}`}>
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </label>
        </div>
        {error && (
          <p id={errorId} className="px-4 text-body-small text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
