import {
  ChevronRight,
  Activity,
  Footprints,
  LayoutDashboard,
  LogOut,
  PackageOpen,
  PackageCheck,
  Printer,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UseAuth } from "@/shared/security/UseAuth";

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
  const { user, logout } = UseAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userRoles: string[] = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return [];
      const parsedUser = JSON.parse(rawUser);
      return Array.isArray(parsedUser?.roles) ? parsedUser.roles : [];
    } catch {
      return [];
    }
  }, []);
  const hasPutAwayRole = userRoles.includes("PutAway");
  const hasReceiverRole = userRoles.includes("Receiver");
  const canAccessPutAway = hasPutAwayRole || hasReceiverRole;

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

        {hasReceiverRole && (
          <NavItem
            icon={<LayoutDashboard className="size-5" />}
            label="Dashboard"
            link=""
          />
        )}
        {hasReceiverRole && (
          <NavItem
            icon={<PackageOpen className="size-5" />}
            label="Incoming Shipments"
            link="incoming"
          />
        )}
        {canAccessPutAway && (
          <NavItem
            icon={<Printer className="size-5" />}
            label={hasPutAwayRole && !hasReceiverRole ? "Put-Away Tasks" : "Assigning & Labeling"}
            link={hasPutAwayRole && !hasReceiverRole ? "putaway" : "labeling"}
          />
        )}
        {hasReceiverRole && (
          <NavItem
            icon={<PackageCheck className="size-5" />}
            label="Assigned"
            link="assigned"
          />
        )}
        <NavItem
          icon={<Activity className="size-5" />}
          label="Activity Log"
          link="activity"
        />

      </nav>

      {/* User Profile */}
      <div className="relative p-4 border-t border-white/10" ref={menuRef}>
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
                to="/inbound/accountsettings"
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

        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all group ${
            isOpen ? "bg-white/10" : "hover:bg-white/5"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 border-2 border-emerald-300/30 flex items-center justify-center">
            <PackageCheck className="size-4 text-white" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
              {user?.firstName || "User"} {user?.lastName || ""}
            </span>
            <span className="text-[10px] text-emerald-400 uppercase tracking-wide opacity-80">
              {user?.roles?.[0] || "Inbound Coordinator"}
            </span>
          </div>
          <ChevronRight
            className={`size-4 text-slate-500 ml-auto hidden lg:block transition-transform duration-200 ${
              isOpen ? "-rotate-90 text-white" : ""
            }`}
          />
        </div>
      </div>
    </aside>
  );
}
