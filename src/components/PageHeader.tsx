interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="pt-[calc(env(safe-area-inset-top)+18px)] pb-2">
      <h1 className="font-serif text-[26px] font-600 leading-tight text-[var(--color-ink)]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">{subtitle}</p>
      )}
    </header>
  );
}
