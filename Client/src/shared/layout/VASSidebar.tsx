import { Activity, ClipboardList, Footprints, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const NavItem = ({
  icon,
  label,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  link: string;
}) => {
  const location = useLocation();
  const absolutePath = link.startsWith("/vas") ? link : `/vas/${link}`.replace(/\/$/, "");
  const isActive = link === "" ? location.pathname === "/vas" : location.pathname === absolutePath;

  return (
    <Link
      to={absolutePath}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
        isActive
          ? "bg-gradient-to-r from-[#FFD700]/15 to-transparent border-l-4 border-[#FFD700] text-white"
          : "text-slate-300 hover:bg-white/5 border-l-4 border-transparent"
      }`}
    >
      <span
        className={`w-5 flex items-center justify-center transition-colors ${isActive ? "text-[#FFD700]" : "group-hover:text-[#FFD700]"}`}
      >
        {icon}
      </span>
      <span className={`text-sm hidden lg:block ${isActive ? "font-bold" : "font-medium"}`}>
        {label}
      </span>
    </Link>
  );
};

export default function VASSidebar() {
  return (
    <aside className="w-20 hidden lg:flex lg:w-64 bg-[#001F3F] h-full flex-col flex-shrink-0 z-50 transition-all duration-300 shadow-2xl">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Footprints className="size-5 text-[#001F3F]" />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-white font-bold text-lg tracking-tight uppercase italic leading-none">
            KicksLogix
          </span>
          <span className="text-[9px] font-bold text-violet-400 uppercase tracking-[0.2em] mt-0.5">
            VAS Portal
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
        <p className="px-2 text-[10px] hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
          VAS Operations
        </p>
        <NavItem icon={<LayoutDashboard className="size-5" />} label="Dashboard" link="" />
        <NavItem icon={<ClipboardList className="size-5" />} label="Main Process" link="processing" />
        <NavItem icon={<Activity className="size-5" />} label="Audit Logs" link="activity" />
      </nav>
    </aside>
  );
}
