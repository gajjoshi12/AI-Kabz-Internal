type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, description, children, eyebrow }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8 pb-6 border-b border-ink-100">
      <div>
        {eyebrow && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-semibold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
            {eyebrow}
          </div>
        )}
        <h1 className="text-display-sm font-bold text-ink-900 tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-ink-500 max-w-2xl">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 flex-wrap shrink-0">{children}</div>
      )}
    </div>
  );
}
