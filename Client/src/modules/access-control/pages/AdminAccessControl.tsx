import AccessControlCards from "@/modules/access-control/components/AccessControlCards";
import AccessControlTable from "@/modules/access-control/components/AccessControlTable";
import AccessControllFormModal from "@/modules/access-control/components/AccessControllFormModal";
import { UseModalState } from "@/modules/access-control/store/UseModalState";
import AcessControllHeader from "@/shared/layout/Header";
import { Plus, Search, SlidersHorizontal } from "lucide-react";

export default function AdminAccessControl() {
  const toggleModal = UseModalState((state) => state.setModalOpen);

  return (
    <>
      <AcessControllHeader
        title="Admin & Access"
        label="Manage accounts and roles"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <AccessControlCards />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 size-4 group-focus-within:text-[#001F3F] transition-colors" />
            <input
              type="text"
              placeholder="Search staff by name, role, or ID..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filter
            </button>
            <button
              onClick={toggleModal}
              className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="size-4 text-[#FFD700]" />
              Create Account
            </button>
          </div>
        </div>

        <AccessControlTable />
        <AccessControllFormModal />
      </div>
    </>
  );
}
