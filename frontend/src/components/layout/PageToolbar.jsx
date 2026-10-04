import { Menu } from "lucide-react";
import LiveIndicator from "../ui/LiveIndicator";
import UserBadge from "./UserBadge";

export default function PageToolbar({ isLive = false, onMenuClick, user }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-10xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Menu size={20} />
          </button>
          <LiveIndicator isLive={isLive} />
        </div>

        {user && <UserBadge user={user} />}
      </div>
    </header>
  );
}
