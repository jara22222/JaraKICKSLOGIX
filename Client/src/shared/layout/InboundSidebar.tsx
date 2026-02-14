import {
  Building2,
  ChevronRight,
  ClipboardList,
  Activity,
  Footprints,
  LayoutDashboard,
  PackageOpen,
  PackageCheck,
  Printer,
} from "lucide-react";
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
  const absolutePath = link.startsWith("/inbound")
    ? link
    : `/inbound/${link}`.replace(/\/$/, "");

  const isActive =
    link === ""
      ? location.pathname === "/inbound"
      : location.pathname === absolutePath;

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
      <span
        className={`text-sm hidden lg:block ${isActive ? "font-bold" : "font-medium"}`}
      >
        {label}
      </span>
    </Link>
  );
};

export default function InboundSidebar() {
  return (
    <aside className="w-20 hidden lg:flex lg:w-64 bg-[#001F3F] h-full flex-col justify-between flex-shrink-0 z-50 transition-all duration-300 shadow-2xl">
      {/* Logo Area */}
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center shadow-lg shadow-yellow-500/20">
          <Footprints className="size-5 text-[#001F3F]" />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-white font-bold text-lg tracking-tight uppercase italic leading-none">
            KicksLogix
          </span>
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-0.5">
            Inbound Portal
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
        <p className="px-2 text-[10px] hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
          Inbound Operations
        </p>

        <NavItem
          icon={<LayoutDashboard className="size-5" />}
          label="Dashboard"
          link=""
        />
        <NavItem
          icon={<PackageOpen className="size-5" />}
          label="Incoming Shipments"
          link="incoming"
        />
        <NavItem
          icon={<ClipboardList className="size-5" />}
          label="Receiving Log"
          link="receivinglog"
        />
        <NavItem
          icon={<Printer className="size-5" />}
          label="Put-Away & Labels"
          link="putaway"
        />
        <NavItem
          icon={<Activity className="size-5" />}
          label="Activity Log"
          link="activity"
        />

        <div className="my-4 border-t border-white/10"></div>

        <p className="px-2 text-[10px] hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
          Quick Access
        </p>

        <NavItem
          icon={<Building2 className="size-5" />}
          label="Admin Panel"
          link="/accesscontroll"
        />
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 border-2 border-emerald-300/30 flex items-center justify-center">
            <PackageCheck className="size-4 text-white" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
              LeBron James
            </span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wide opacity-80">
              Inbound Coordinator
            </span>
          </div>
          <ChevronRight className="size-4 text-slate-500 ml-auto hidden lg:block group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}
