export default function PageHeader({ eyebrow, title, highlight, subtitle, children }) {
  return (
    <div className="mb-8 text-center">
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-brand-green">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 text-3xl font-extrabold text-brand-navy md:text-4xl">
        {title}{" "}
        {highlight && <span className="text-brand-green">{highlight}</span>}
      </h1>
      {subtitle && <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">{subtitle}</p>}
      {children && <div className="mt-4 flex justify-center gap-3">{children}</div>}
    </div>
  );
}
