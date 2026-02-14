import { Outlet } from "react-router-dom";
import OutboundBottomNav from "./OutboundBottomNav";

export default function OutboundLayout() {
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Main content area — scrollable, with bottom padding for nav bar */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation — fixed at bottom (mobile-first) */}
      <OutboundBottomNav />
    </div>
  );
}
