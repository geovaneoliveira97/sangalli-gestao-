import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

// primary = Filled Button; secondary, danger e success = Outlined Button; ghost = Text Button.
export const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90',
  secondary: 'border border-outline text-primary hover:bg-primary/10',
  danger: 'border border-error text-error hover:bg-error-container',
  success: 'border border-success text-success hover:bg-success-container',
  ghost: 'text-primary hover:bg-primary/10',
};

export const SIZE_CLASSES: Record<Size, string> = {
  sm: 'touch-target min-h-10 px-4 text-label-large',
  md: 'min-h-12 px-6 text-label-large',
};

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, disabled, className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
