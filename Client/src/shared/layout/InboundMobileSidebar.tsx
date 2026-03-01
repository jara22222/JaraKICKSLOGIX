import {
  Activity,
  Footprints,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  PackageOpen,
  Printer,
  Settings,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { UseAuth } from "@/shared/security/UseAuth";

export default function InboundMobileSidebar() {
  const { user, logout } = UseAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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
  const handleLogout = () => {
    setIsMobileOpen(false);
    logout();
  };

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
    const isActive =
      link === ""
        ? location.pathname === "/inbound"
        : location.pathname.includes(link);
    return (
      <Link
        to={link.startsWith("/") ? link : `/inbound/${link}`}
        onClick={() => setIsMobileOpen(false)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group ${
          isActive
            ? "bg-gradient-to-r from-[#FFD700]/15 to-transparent border-l-4 border-[#FFD700] text-white"
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
        className={`fixed top-4 lg:hidden z-[60] p-2 bg-[#001F3F] text-white rounded-lg shadow-lg hover:bg-[#00162e] flex flex-col transition-all duration-300 ease-in-out ${isMobileOpen ? "left-[264px]" : "left-4"}`}
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#001F3F]/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full w-64 bg-[#001F3F] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FFD700] rounded flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <Footprints className="size-5 text-[#001F3F]" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg tracking-tight uppercase italic leading-none">
              KicksLogix
            </span>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-[0.2em] mt-0.5">
              Inbound Portal
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4 scrollbar-hide">
          <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Inbound Operations
          </p>
          {hasReceiverRole && (
            <NavItem icon={<LayoutDashboard className="size-5" />} label="Dashboard" link="" />
          )}
          {hasReceiverRole && (
            <NavItem
              icon={<PackageOpen className="size-5" />}
              label="Incoming Shipments"
              link="incoming"
            />
          )}
          {(hasPutAwayRole || hasReceiverRole) && (
            <NavItem
              icon={<Printer className="size-5" />}
              label={hasPutAwayRole && !hasReceiverRole ? "Put-Away Tasks" : "Assigning & Labeling"}
              link={hasPutAwayRole && !hasReceiverRole ? "putaway" : "labeling"}
            />
          )}
          {hasReceiverRole && (
            <NavItem icon={<PackageCheck className="size-5" />} label="Assigned" link="assigned" />
          )}
          <NavItem icon={<Activity className="size-5" />} label="Activity Log" link="activity" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-emerald-600 border-2 border-emerald-300/30 flex items-center justify-center">
              <PackageCheck className="size-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white group-hover:text-[#FFD700] transition-colors">
                {user?.firstName || "User"} {user?.lastName || ""}
              </span>
              <span className="text-[10px] text-emerald-400 uppercase tracking-wide opacity-80">
                {user?.roles?.[0] || "Inbound Coordinator"}
              </span>
            </div>
          </div>
          <Link
            to="/inbound/accountsettings"
            onClick={() => setIsMobileOpen(false)}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/5 transition-colors"
          >
            <Settings className="size-4" />
            Account Settings
          </Link>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
