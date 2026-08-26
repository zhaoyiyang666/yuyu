import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const sizeMap = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3.5 text-[15px]',
};

export function Button({
  variant = 'solid',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-500 transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none min-h-[44px]';
  const variants: Record<string, string> = {
    solid:
      'bg-[var(--color-clay)] text-white shadow-[0_6px_16px_-8px_rgba(199,123,90,0.7)] hover:bg-[var(--color-clay-deep)]',
    outline:
      'border border-[var(--color-clay)] text-[var(--color-clay-deep)] bg-transparent hover:bg-[var(--color-clay-soft)]/30',
    ghost: 'text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-deep)]',
    danger: 'bg-[var(--color-danger-bg)] text-white hover:brightness-110',
  };
  return (
    <button className={`${base} ${sizeMap[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
