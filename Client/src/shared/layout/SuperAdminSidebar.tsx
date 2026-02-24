import {
  Building2,
  ChevronRight,
  Eye,
  Footprints,
  LogOut,
  ScrollText,
  Settings,
  Truck,
  Users,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";
import { UseAuth } from "../security/UseAuth";
import { useEffect, useRef, useState } from "react";

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

  // FIX: Clean up slashes to prevent // duplicates
  const cleanLink = link.startsWith("/") ? link.substring(1) : link;
  const absolutePath = link.startsWith("/superadmin")
    ? link
    : `/superadmin/${cleanLink}`.replace(/\/$/, "");

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
  const { user, logout } = UseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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

        <NavItem icon={<Eye className="size-5" />} label="Overview" link="" />
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
      <div className="relative p-4 border-t border-white/10" ref={menuRef}>
        {/* --- Dropdown Menu --- */}
        {isOpen && (
          <div className="absolute bottom-full left-4 mb-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Account
              </p>
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.email || "user@kickslogix.com"}
              </p>
            </div>

            <div className="p-2">
              <Link
                to="/settings/profile"
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="size-4" />
                Account Settings
              </Link>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* --- Profile Toggle --- */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group ${
            isOpen ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.charAt(0) || "J"}
          </div>

          <div className="flex flex-col text-sm font-medium hidden lg:block">
            <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[10px] text-[#FFD700] uppercase tracking-wide opacity-80">
              {user?.roles?.[0] || "Super Admin"}
            </span>
          </div>

          <div className="hidden lg:block ml-auto">
            <ChevronRight
              className={`size-4 text-slate-500 transition-transform duration-200 ${isOpen ? "-rotate-90" : ""}`}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
