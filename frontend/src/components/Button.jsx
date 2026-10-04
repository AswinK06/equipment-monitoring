const VARIANT_STYLES = {
  primary:
    "bg-brand-mint text-brand-navy hover:bg-brand-green focus-visible:ring-brand-mint shadow-sm",
  secondary:
    "bg-white text-brand-navy border border-slate-200 hover:bg-slate-50 hover:text-brand-ink focus-visible:ring-slate-400 shadow-sm",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
};

export default function Button({
  variant = "secondary",
  onClick,
  disabled = false,
  children,
  className = "",
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = VARIANT_STYLES[variant] || VARIANT_STYLES.secondary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
