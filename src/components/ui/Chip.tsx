import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  color?: string;
  bg?: string;
}

/** 筛选/标签 Chip */
export function Chip({ children, active, onClick, color, bg }: ChipProps) {
  const style =
    color && bg ? { color, backgroundColor: bg } : undefined;
  return (
    <button
      onClick={onClick}
      style={style}
      className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-500 transition ${
        style
          ? ''
          : active
            ? 'bg-[var(--color-sage)] text-white'
            : 'bg-white/70 text-[var(--color-ink-soft)] border border-[var(--color-line)]'
      }`}
    >
      {children}
    </button>
  );
}
