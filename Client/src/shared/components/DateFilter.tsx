import { CalendarDays } from "lucide-react";

export default function DateFilter() {
  return (
    <div className="flex items-center bg-white border border-slate-200 h-[46px] rounded-xl px-3 gap-2 shadow-sm">
      <CalendarDays className="size-4 text-slate-400 shrink-0" />
      <div className="flex items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">
          From
        </span>
        <input
          type="date"
          className="text-xs text-slate-600 font-medium focus:outline-none bg-transparent"
        />
      </div>
      <div className="w-px h-4 bg-slate-200"></div>
      <div className="flex items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase mr-2">
          To
        </span>
        <input
          type="date"
          className="text-xs text-slate-600 font-medium focus:outline-none bg-transparent"
        />
      </div>
    </div>
  );
}
