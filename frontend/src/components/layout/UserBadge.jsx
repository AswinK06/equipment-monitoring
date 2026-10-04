export default function UserBadge({ user }) {
  if (!user) return null;

  const userInitial = (user?.displayName?.[0] || user?.email?.[0] || "U").toUpperCase();
  const isAdmin = user?.role?.toUpperCase() === "ADMIN" || user?.role === "Admin";
  const roleBadgeStyle = isAdmin
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-semibold text-sm">
        {userInitial}
      </div>

      <div>
        <div className="hidden sm:block text-sm font-semibold text-slate-800 leading-tight">
          {user.displayName || user.email}
        </div>
        <div className="flex items-center gap-2 sm:mt-0.5">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${roleBadgeStyle}`}
          >
            {user.role}
          </span>
          <span className="hidden md:inline text-xs text-slate-500 truncate max-w-[200px]">
            {user.email}
          </span>
        </div>
      </div>
    </div>
  );
}
