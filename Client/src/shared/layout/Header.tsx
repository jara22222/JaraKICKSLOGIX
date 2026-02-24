import { Bell, ChevronRight } from "lucide-react";
import MobileSidebar from "@/shared/layout/MobileSidebar";
import { Link, useLocation } from "react-router-dom";

const BREADCRUMB_LABELS: Record<string, string> = {
  accesscontroll: "Admin Panel",
  accessmanagement: "Admin & Access",
  suppliermanagement: "Supply Management",
  binmanagement: "Bin Management",
  binsarchived: "Bins Archived",
  inboundmanagement: "Inbound",
  outboundmanagement: "Outbound",
  inventorymanagement: "Inventory",
  profilesettings: "Account Settings",
};

export default function AcessControllHeader({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <>
      <MobileSidebar />
      <header className="h-14 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 lg:px-8 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <Link
              to="/accesscontroll"
              className="text-slate-400 hover:text-[#001F3F] transition-colors font-medium"
            >
              Dashboard
            </Link>
            {segments.slice(1).map((seg, idx) => (
              <span key={idx} className="flex items-center gap-1">
                <ChevronRight className="size-3 text-slate-300" />
                <span className="text-[#001F3F] font-bold">
                  {BREADCRUMB_LABELS[seg] || seg}
                </span>
              </span>
            ))}
            {segments.length <= 1 && (
              <span className="flex items-center gap-1">
                <ChevronRight className="size-3 text-slate-300" />
                <span className="text-[#001F3F] font-bold">{title}</span>
              </span>
            )}
          </nav>
          <span className="text-[10px] text-slate-400 hidden lg:block ml-2 font-medium">
            — {label}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <button className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-[#001F3F] transition-colors relative">
            <Bell className="size-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>
    </>
  );
}
