import { Search } from "lucide-react";

export default function SearchToolBar() {
  return (
    <>
      {/* Action Toolbar */}
      <div className="flex gap-3 w-full md:w-auto justify-end">
        <div className="relative w-full sm:w-96 group">
          <i className="fa-solid fa-search absolute left-4 top-3.5 text-slate-400 text-sm group-focus-within:text-[#001F3F] transition-colors">
            <Search className="size-4" />
          </i>
          <input
            type="text"
            placeholder="Search staff by name, role, or ID..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
          />
        </div>
      </div>
      </>
  );
}
