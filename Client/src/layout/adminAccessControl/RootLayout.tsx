import SidebarComponent from "@/components/accesscontrollcomponents/SidebarComponent";
import { Outlet } from "react-router-dom";

export default function AccessControlRootLayout() {
  return (
    <div className="bg-slate-50 text-slate-800 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <SidebarComponent />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}
