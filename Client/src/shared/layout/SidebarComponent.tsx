import {
  Archive,
  Boxes,
  FileCheck,
  FolderKanban,
  Footprints,
  HandCoins,
  ScrollText,
  PieChart,
  QrCode,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Link, useLocation } from "react-router-dom";
const NavItem = ({
  icon,
  label,
  link,
}: {
  icon: ReactNode;
  label: string;
  link: string;
}) => {
  const location = useLocation();
  const absolutePath = link.startsWith("/accesscontroll")
    ? link
    : `/accesscontroll/${link}`.replace(/\/$/, ""); // Prevents trailing slash on Overview

  const isActive = location.pathname === absolutePath;

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
          className={`text-sm hidden lg:block ${isActive ? "font-bold" : "font-medium"}`}
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
      <aside className="w-20 hidden lg:flex lg:w-64 bg-[#001F3F] h-full flex-col flex-shrink-0 z-50 transition-all duration-300 shadow-2xl">
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
          <p className="px-2 text-[10px] hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
            Administration
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
            icon={<Archive className="size-5" />}
            label="Archived Users"
            link={"archivedusers"}
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
            icon={<Archive className="size-5" />}
            label="Bins Archived"
            link={"binsarchived"}
          />

          <div className="my-3 border-t border-white/10" />
          <p className="px-2 text-[10px] hidden lg:block font-bold text-slate-400 uppercase tracking-widest mb-2">
            Warehouse Operations
          </p>

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
          <NavItem
            icon={<ScrollText className="size-5" />}
            label="Audit Logs"
            link={"auditlogs"}
          />
        </nav>

      </aside>
    </>
  );
}
