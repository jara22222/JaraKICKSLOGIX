import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  Activity,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Home", path: "/outbound" },
  { icon: ScanLine, label: "Reassign", path: "/outbound/reassign" },
  { icon: ClipboardList, label: "Pick List", path: "/outbound/picklist" },
  { icon: Activity, label: "Log", path: "/outbound/activity" },
];

export default function OutboundBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#001F3F] border-t border-white/10 shadow-[0_-4px_24px_rgba(0,31,63,0.3)] safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === "/outbound"
              ? location.pathname === "/outbound"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[64px] ${
                isActive
                  ? "text-[#FFD700]"
                  : "text-slate-400 active:scale-95"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-[#FFD700]/15 shadow-lg shadow-yellow-500/10"
                    : "hover:bg-white/5"
                }`}
              >
                <item.icon className={`size-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isActive ? "text-[#FFD700]" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
