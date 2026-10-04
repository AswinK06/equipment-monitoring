import { Activity, ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { selectActiveAlerts } from "../../store/slices/alertsSlice";
import { NAVIGATION_ITEMS } from "../../constants/navigation";
import SidebarItem from "./SidebarItem";

export default function Sidebar({
  collapsed = false,
  onToggle,
  onCloseMobile,
}) {
  const { logout } = useAuth();
  const activeAlerts = useSelector(selectActiveAlerts);
  const activeAlertCount = activeAlerts ? activeAlerts.length : 0;

  return (
    <aside
      className={`relative z-30 sticky top-0 h-screen shrink-0 flex flex-col bg-brand-navy text-white transition-all duration-300 border-r border-white/10 select-none ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Vertically centred collapse toggle button on right edge */}
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute top-1/2 -right-3 -translate-y-1/2 z-40 hidden lg:flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-brand-navy2 text-slate-300 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
        </button>
      )}

      {/* Top Bar / Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 justify-between">
        <div className={`flex items-center gap-3 ${collapsed ? "mx-auto" : ""}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-navy2 text-brand-mint ring-1 ring-white/10">
            <Activity size={20} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-extrabold tracking-widest text-white truncate">
                SUSTAINABYTE
              </div>
              <div className="text-[10px] font-bold tracking-widest text-brand-mint truncate">
                EQUIPMENT MONITOR
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-2 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const badge = item.to === "/alerts" ? activeAlertCount : 0;
          return (
            <SidebarItem
              key={item.to}
              to={item.to}
              end={item.end}
              icon={item.icon}
              label={item.label}
              badge={badge}
              collapsed={collapsed}
              onClick={onCloseMobile}
            />
          );
        })}
      </nav>

      {/* Bottom Area: Sign out button only */}
      <div className="p-3 border-t border-white/10">
        <div className="relative group">
          <button
            type="button"
            onClick={() => {
              onCloseMobile?.();
              logout();
            }}
            title="Sign out"
            aria-label="Sign out"
            className={`flex items-center rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors w-full ${
              collapsed ? "justify-center" : "gap-3 px-3 text-xs font-semibold"
            }`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign out</span>}
          </button>
          {collapsed && (
            <div className="absolute left-full ml-3 hidden rounded-lg bg-brand-navy2 px-2.5 py-1 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 group-hover:block z-50 whitespace-nowrap pointer-events-none top-1/2 -translate-y-1/2">
              Sign out
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
