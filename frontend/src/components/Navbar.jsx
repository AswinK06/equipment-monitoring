import { Activity, Bell, LayoutGrid, LogOut, Radio, User as UserIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar({ activePage, alertCount = 0, isLive = false, onNavigate }) {
  const { user, logout } = useAuth();

  const tabs = [
    { id: "dashboard", label: "Equipment", icon: LayoutGrid },
    { id: "alerts", label: "Active alerts", icon: Bell, badge: alertCount },
  ];

  const roleBadgeStyle =
    user?.role === "Admin"
      ? "bg-brand-mint text-brand-navy font-bold"
      : "bg-slate-200 text-slate-700 font-semibold";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy shadow-md">
      <div className="h-0.5 w-full bg-gradient-to-r from-brand-mint via-brand-green to-emerald-400" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy2 text-brand-mint ring-1 ring-white/10">
            <Activity size={20} />
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-widest text-white">SUSTAINABYTE</div>
            <div className="text-[10px] font-bold tracking-widest text-brand-mint">
              EQUIPMENT MONITOR
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id || (tab.id === "dashboard" && activePage === "detail");
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                  isActive ? "text-brand-mint" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-[13px] h-0.5 bg-brand-mint" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-white/10">
            <Radio size={14} className={isLive ? "text-emerald-400 animate-pulse" : "text-red-400"} />
            <span>{isLive ? "Live" : "Reconnecting…"}</span>
          </div>

          {user && (
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{user.email}</span>
                <span className="text-[10px] text-slate-400">{user.displayName}</span>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider ${roleBadgeStyle}`}>
                {user.role}
              </span>
              <button
                type="button"
                onClick={() => logout()}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
