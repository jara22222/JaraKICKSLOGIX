import SidebarComponent from "@/shared/layout/SidebarComponent";
import RealtimeStatusBadge from "@/shared/layout/RealtimeStatusBadge";
import { useRoleRealtimeSync } from "@/shared/hooks/useRoleRealtimeSync";
import { Outlet } from "react-router-dom";

export default function AccessControlRootLayout() {
  useRoleRealtimeSync("branch");

  return (
    <div className="bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <SidebarComponent />
      <RealtimeStatusBadge />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}
