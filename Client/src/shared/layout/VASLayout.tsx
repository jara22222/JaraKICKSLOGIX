import { Outlet } from "react-router-dom";
import VASBottomNav from "./VASBottomNav";

export default function VASLayout() {
  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      <VASBottomNav />
    </div>
  );
}
