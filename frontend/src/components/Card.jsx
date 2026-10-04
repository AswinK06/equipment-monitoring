export default function Card({
  title,
  description,
  actions,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {hasHeader && (
        <div className={`p-6 border-b border-slate-100 flex flex-wrap items-start justify-between gap-4 ${headerClassName}`}>
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold text-slate-800 leading-snug">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-slate-500 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
