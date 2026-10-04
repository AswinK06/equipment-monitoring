import { NavLink, useLocation } from "react-router-dom";

export default function SidebarItem({
  to,
  icon: Icon,
  label,
  collapsed = false,
  badge = 0,
  end = false,
  onClick,
}) {
  const location = useLocation();
  const isEquipment = to === "/";
  const checkActive = (navLinkActive) => {
    if (isEquipment) {
      return location.pathname === "/" || location.pathname.startsWith("/equipment");
    }
    return navLinkActive;
  };

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive: navLinkActive }) => {
        const isActive = checkActive(navLinkActive);
        return `group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
          collapsed ? "justify-center" : "gap-3"
        } ${
          isActive
            ? "relative bg-white/10 text-white shadow-lg shadow-black/20"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`;
      }}
    >
      {({ isActive: navLinkActive }) => {
        const isActive = checkActive(navLinkActive);
        return (
          <>
            {isActive && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-mint" />
            )}

            <div className="relative flex items-center justify-center shrink-0">
              {Icon && (
                <Icon
                  size={18}
                  className={
                    isActive
                      ? "text-brand-mint"
                      : "text-slate-300 group-hover:text-white transition-colors"
                  }
                />
              )}
              {collapsed && badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white tabular-nums">
                  {badge}
                </span>
              )}
            </div>

            {!collapsed && (
              <>
                <span className="truncate">{label}</span>
                {badge > 0 && (
                  <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
                    {badge}
                  </span>
                )}
              </>
            )}

            {collapsed && (
              <div className="absolute left-full ml-3 hidden rounded-lg bg-brand-navy2 px-2.5 py-1 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10 group-hover:block z-50 whitespace-nowrap pointer-events-none">
                <div className="flex items-center gap-2">
                  <span>{label}</span>
                  {badge > 0 && (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        );
      }}
    </NavLink>
  );
}
