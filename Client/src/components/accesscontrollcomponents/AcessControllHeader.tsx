import { Bell } from "lucide-react";
import MobileSidebar from "./MobileSidebar";

export default function AcessControllHeader({
  title,
  label,
}: {
  title: string;
  label: string;
}) {
  return (
    <>
      <MobileSidebar />
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-40 sticky top-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl hidden lg:flex font-bold text-[#001F3F]">
            {title}
          </h1>
          <span className="h-4 w-px bg-slate-300 hidden lg:flex"></span>
          <span className="text-sm text-slate-500 hidden lg:flex">{label}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          {/* Branch Selector */}

          <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-[#001F3F] transition-colors relative">
            <i className="fa-regular fa-bell">
              <Bell className="size-4" />
            </i>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>
    </>
  );
}
