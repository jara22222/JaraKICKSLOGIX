import { Outlet } from "react-router-dom";
import VASSidebar from "./VASSidebar";
import VASMobileSidebar from "./VASMobileSidebar";
import RoleNotificationBell from "./RoleNotificationBell";
import RealtimeStatusBadge from "./RealtimeStatusBadge";
import { useRoleRealtimeSync } from "@/shared/hooks/useRoleRealtimeSync";

export default function VASLayout() {
  useRoleRealtimeSync("vas");

  return (
    <div className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <VASMobileSidebar />
      <VASSidebar />
      <RoleNotificationBell storageKey="kickslogix-vas-notifications" />
      <RealtimeStatusBadge rightOffsetClass="right-16" />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}
