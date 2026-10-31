import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { fieldControlClass, fieldLabelClass } from './fieldStyles';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = '', required, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className={`h-14 px-3 ${fieldControlClass(Boolean(error))} ${className}`}
            {...props}
          >
            {children}
          </select>
          <label htmlFor={selectId} className={fieldLabelClass(Boolean(error))}>
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
Select.displayName = 'Select';
