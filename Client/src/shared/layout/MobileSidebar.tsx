import {
  Boxes,
  ChevronRight,
  FileCheck,
  FolderKanban,
  Footprints,
  HandCoins,
  Menu,
  PieChart,
  QrCode,
  Users,
  X,
} from "lucide-react";
// Note: If 'Link' is for navigation, import it from 'react-router-dom'.
// If it was meant to be an icon, rename the import (e.g. LinkIcon) to avoid conflicts.
import { Link, useLocation } from "react-router-dom"; // Assuming you use react-router
import { useState } from "react";

export default function MobileSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({
    icon,
    label,
    link,
  }: {
    icon: any;
    label: string;
    link: string;
  }) => {
    const location = useLocation();
    const isActive =
      link === ""
        ? location.pathname === "/accesscontroll"
        : location.pathname.includes(link);
    {
      console.log(location.pathname);
    }
    return (
      <Link
        to={`/accesscontroll${link}`}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
          isActive
            ? "bg-gradient-to-r from-[#FFD700]/10 to-transparent border-l-4 border-[#FFD700] text-white"
            : "text-slate-300 hover:bg-white/5 border-l-4 border-transparent"
        }`}
      >
        <div
          className={`w-5 flex items-center justify-center transition-colors ${
            isActive ? "text-[#FFD700]" : "group-hover:text-[#FFD700]"
          }`}
        >
          {icon}
        </div>

        {/* FIXED: Simplified classes. Removed 'hidden' and kept just one font-weight logic */}
        <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className={`fixed top-4 lg:hidden z-[60] p-2 bg-[#001F3F] text-white rounded-lg shadow-lg hover:bg-[#00162e] flex flex-col
    transition-all duration-300 ease-in-out 
    ${isMobileOpen ? "left-[264px] animate-beat" : "left-4"}`}
      >
        {/* Removed <i> wrapper here too */}
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* MOBILE BACKDROP */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#001F3F]/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 h-full w-64 bg-[#001F3F] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out
            ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        {/* Logo Area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center shadow-lg shadow-yellow-500/20">
            {/* Removed <i> wrapper */}
            <Footprints className="size-5 text-[#001F3F]" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight uppercase italic block">
            KicksLogix
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
          {/* Cleaned up conflicting classes: removed text-[10px] and font-bold vs medium conflict */}
          <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
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
            link={"/accessmanagement"}
          />
          <NavItem
            icon={<Boxes className="size-5" />}
            label="Supply Management"
            link={"/suppliermanagement"}
          />
          <NavItem
            icon={<QrCode className="size-5" />}
            label="Bin Management"
            link={"/binmanagement"}
          />
          <NavItem
            icon={<FolderKanban className="size-5" />}
            label="Inbound"
            link={"/inboundmanagement"}
          />
          <NavItem
            icon={<HandCoins className="size-5" />}
            label="Inventory"
            link={"/inventorymanagement"}
          />
          <NavItem
            icon={<FileCheck className="size-5" />}
            label="Outbound"
            link={"/outboundmanagement"}
          />
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 border border-white/20"></div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
                Jara Joaquin
              </span>
              <span className="text-[10px] text-[#FFD700] uppercase tracking-wide opacity-80">
                Super Admin
              </span>
            </div>
            {/* Removed <i> and fa-solid wrapper */}
            <ChevronRight className="size-4 text-slate-500 ml-auto group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
}
