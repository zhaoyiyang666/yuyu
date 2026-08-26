import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/** 基础卡片：奶油纸底、细描边、克制微投影 */
export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white/70 shadow-[0_1px_2px_rgba(43,36,32,0.04),0_8px_24px_-16px_rgba(43,36,32,0.15)] ${
        onClick ? 'cursor-pointer transition active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  action?: ReactNode;
}

export function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between px-1">
      <h2 className="font-serif text-[15px] font-600 tracking-wide text-[var(--color-ink)]">
        {children}
      </h2>
      {action}
    </div>
  );
}
