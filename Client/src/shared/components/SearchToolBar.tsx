import { Search } from "lucide-react";

export default function SearchToolBar({
  placeholder = "Search...",
}: {
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-96 group">
      <Search className="absolute left-4 top-3.5 text-slate-400 size-4 group-focus-within:text-[#001F3F] transition-colors" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
      />
    </div>
  );
}
