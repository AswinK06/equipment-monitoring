export default function PageHeader({ eyebrow, title, highlight, subtitle, children }) {
  return (
    <div className="mb-10 text-center">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-brand-green">{eyebrow}</p>
      )}
      <h1 className="mt-1 text-3xl font-extrabold text-slate-800 sm:text-4xl">
        {title} {highlight && <span className="text-brand-green">{highlight}</span>}
      </h1>
      {subtitle && <p className="mt-3 text-base text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
      {children && <div className="mt-6 flex justify-center gap-3">{children}</div>}
    </div>
  );
}
