import { Outlet } from "react-router-dom";
import OutboundSidebar from "./OutboundSidebar";
import OutboundMobileSidebar from "./OutboundMobileSidebar";
import RoleNotificationBell from "./RoleNotificationBell";
import { useRoleRealtimeSync } from "@/shared/hooks/useRoleRealtimeSync";

export default function OutboundLayout() {
  useRoleRealtimeSync("outbound");

  return (
    <div className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <OutboundMobileSidebar />
      <OutboundSidebar />
      <RoleNotificationBell storageKey="kickslogix-dispatch-notifications" />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}
