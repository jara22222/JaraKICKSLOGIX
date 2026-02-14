import {
  Boxes,
  ChevronRight,
  FileCheck,
  FolderKanban,
  Footprints,
  HandCoins,
  PieChart,
  QrCode,
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
  const absolutePath = link.startsWith("/accesscontroll")
    ? link
    : `/accesscontroll/${link}`.replace(/\/$/, ""); // Prevents trailing slash on Overview

  const isActive = location.pathname === absolutePath;

  {
    console.log(isActive);
  }
  return (
    <>
      <Link
        to={absolutePath}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
          isActive
            ? "bg-gradient-link-r from-[#FFD700]/10 link-transparent border-l-4 border-[#FFD700] text-white"
            : "text-slate-300 hover:bg-white/5 border-l-4 border-transparent"
        }`}
      >
        <i
          className={`w-5 text-center transition-colors ${isActive ? "text-[#FFD700]" : "group-hover:text-[#FFD700]"}`}
        >
          <i className={`fa-solid`}>{icon}</i>
        </i>
        <span
          className={`text-sm font-medium hidden lg:block ${isActive ? "font-bold" : "font-medium"}`}
        >
          {label}
        </span>
      </Link>
    </>
  );
};
export default function SidebarComponent() {
  return (
    <>
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-20 hidden lg:flex lg:w-64 bg-[#001F3F] h-full flex flex-col justify-between flex-shrink-0 z-50 transition-all duration-300 shadow-2xl">
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center text-kicks-blue shadow-lg shadow-kicks-yellow/20">
            <i className=" text-sm">
              <Footprints />
            </i>
          </div>
          <span className="text-white font-bold text-lg tracking-tight uppercase italic hidden lg:block">
            KicksLogix
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
          <p className="px-2 text-[10px] text-sm font-medium hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
            Core Modules
          </p>

          <NavItem
            icon={<PieChart className="size-5" />}
            label="Overview"
            link={""}
          />
          <NavItem
            icon={<Users className="size-5" />}
            label="Admin & Access"
            link={"accessmanagement"}
          />
          <NavItem
            icon={<Boxes className="size-5" />}
            label="Supply Management"
            link={"suppliermanagement"}
          />
          <NavItem
            icon={<QrCode className="size-5" />}
            label="Bin Management"
            link={"binmanagement"}
          />
          <NavItem
            icon={<FolderKanban className="size-5" />}
            label="Inbound"
            link={"inboundmanagement"}
          />
          <NavItem
            icon={<HandCoins className="size-5" />}
            label="Inventory"
            link={"inventorymanagement"}
          />
          <NavItem
            icon={<FileCheck className="size-5" />}
            label="Outbound"
            link={"outboundmanagement"}
          />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-gradient-link-tr from-blue-400 link-blue-600 border border-white/20"></div>
            <div className="flex flex-col text-sm font-medium hidden lg:block">
              <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
                Jara Joaquin
              </span>
              <span className="text-[10px] text-[#FFD700] uppercase tracking-wide opacity-80">
                Super Admin
              </span>
            </div>
            <i className="fa-solid text-sm font-medium hidden lg:block text-xs text-slate-500 ml-auto group-hover:text-white transition-colors">
              <ChevronRight className="size-4" />
            </i>
          </div>
        </div>
      </aside>
    </>
  );
}
