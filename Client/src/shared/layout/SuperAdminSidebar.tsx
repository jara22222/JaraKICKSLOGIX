import {
  Building2,
  ChevronRight,
  Eye,
  Footprints,
  ScrollText,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

const NavItem = ({
  icon,
  label,
  link,
}: {
  icon: any;
  label: any;
  link: string;
}) => {
  const location = useLocation();
  const absolutePath = link.startsWith("/superadmin")
    ? link
    : `/superadmin/${link}`.replace(/\/$/, "");

  const isActive = location.pathname === absolutePath;

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

export default function SuperAdminSidebar() {
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
          <span className="text-[9px] font-bold text-[#FFD700] uppercase tracking-[0.2em] mt-0.5">
            Super Admin
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
        <p className="px-2 text-[10px] hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
          God View
        </p>

        <NavItem
          icon={<Eye className="size-5" />}
          label="Overview"
          link=""
        />
        <NavItem
          icon={<Users className="size-5" />}
          label="Branch Managers"
          link="managers"
        />
        <NavItem
          icon={<Truck className="size-5" />}
          label="Supplier Registry"
          link="suppliers"
        />
        <NavItem
          icon={<ScrollText className="size-5" />}
          label="Audit Logs"
          link="auditlogs"
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
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 border-2 border-[#FFD700]/30 flex items-center justify-center">
            <ShieldCheck className="size-4 text-[#001F3F]" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
              Jara Joaquin
            </span>
            <span className="text-[10px] text-[#FFD700] uppercase tracking-wide opacity-80">
              Super Admin
            </span>
          </div>
          <ChevronRight className="size-4 text-slate-500 ml-auto hidden lg:block group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
}
