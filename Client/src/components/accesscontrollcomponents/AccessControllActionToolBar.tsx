import { UseModalState } from "@/zustand/UseModalState";
import AccessControllFormModal from "./AccessControllFormModal";
import { Funnel, Search } from "lucide-react";

export default function AccessControllActionToolBar() {
  const toggleModal = UseModalState((state) => state.setModalOpen);
  return (
    <>
      {/* Action Toolbar */}

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

      <div className="flex items-center gap-3">
        <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
          <i className="fa-solid fa-filter ">
            <Funnel className="size-4" />
          </i>{" "}
          Filter
        </button>
        <button
          onClick={toggleModal}
          className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
        >
          <i className="fa-solid fa-plus text-[#FFD700]"></i>
          Create Account
        </button>
      </div>
      <AccessControllFormModal />
    </>
  );
}
