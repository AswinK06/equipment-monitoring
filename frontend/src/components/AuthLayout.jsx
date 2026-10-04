import { Activity, Check } from "lucide-react";

export default function AuthLayout({ title, subtitle, children, footer }) {
  const points = [
    "Live equipment readings",
    "Instant threshold alerts",
    "Role-based access for your team",
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Panel (hidden below lg, 1/2 width) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-brand-navy p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 h-96 w-96 rounded-full bg-brand-navy2/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-96 w-96 rounded-full bg-brand-mint/10 blur-3xl pointer-events-none" />

        {/* Wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy2 text-brand-mint ring-1 ring-white/10">
            <Activity size={24} />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-widest text-white">SUSTAINABYTE</div>
            <div className="text-[10px] font-bold tracking-widest text-brand-mint">
              EQUIPMENT MONITOR
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight sm:text-5xl text-white">
            Energy <span className="text-brand-mint">intelligence</span> for industrial equipment
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed font-medium">
            Connected by IoT. Driven by AI. Built for Net Zero.
          </p>

          <ul className="mt-8 space-y-4">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-mint/20 text-brand-mint ring-1 ring-brand-mint/30">
                  <Check size={14} className="stroke-[3]" />
                </div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-400">
          &copy; 2026 Sustainabyte Technologies · Industrial IoT Platform
        </div>
      </div>

      {/* Right Side */}
      <div className="min-h-screen flex flex-1 flex-col items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Wordmark (hidden on lg+) */}
          <div className="mb-8 lg:hidden flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-mint shadow-md">
              <Activity size={26} />
            </div>
            <div className="text-xl font-extrabold tracking-widest text-brand-navy">SUSTAINABYTE</div>
            <div className="text-xs font-bold tracking-widest text-brand-green mt-0.5">
              EQUIPMENT MONITOR
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-brand-navy tracking-tight">{title}</h2>
              {subtitle && (
                <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-6 text-center text-sm text-slate-500">
                {footer}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            &copy; 2026 Sustainabyte Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
