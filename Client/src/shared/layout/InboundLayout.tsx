import InboundSidebar from "@/shared/layout/InboundSidebar";
import { Outlet } from "react-router-dom";

export default function InboundLayout() {
  return (
    <div className="bg-slate-50 text-slate-800 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <InboundSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
}
