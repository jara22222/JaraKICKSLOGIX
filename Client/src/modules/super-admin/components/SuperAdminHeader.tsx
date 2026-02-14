import { Bell, ShieldCheck } from "lucide-react";
import SuperAdminMobileSidebar from "@/shared/layout/SuperAdminMobileSidebar";

export default function SuperAdminHeader({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  return (
    <>
      <SuperAdminMobileSidebar />
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#FFD700]" />
            <h1 className="text-xl font-bold text-[#001F3F]">{title}</h1>
          </div>
          <span className="h-4 w-px bg-slate-300 hidden lg:flex"></span>
          <span className="text-sm text-slate-500 hidden lg:flex">{label}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-[#001F3F] transition-colors relative">
            <Bell className="size-4" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>
    </>
  );
}
