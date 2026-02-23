import SuperAdminSidebar from "@/shared/layout/SuperAdminSidebar";
import { Loader } from "lucide-react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

export default function SuperAdminLayout() {
  return (
    <div className="bg-slate-50 text-slate-800 h-screen w-full flex overflow-hidden font-sans selection:bg-[#FFD700]/30">
      <SuperAdminSidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
