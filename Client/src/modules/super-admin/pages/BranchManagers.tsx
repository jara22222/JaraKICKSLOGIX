import SuperAdminHeader from "@/modules/super-admin/components/SuperAdminHeader";
import ManagerTable from "@/modules/super-admin/components/ManagerTable";
import ManagerFormModal from "@/modules/super-admin/components/ManagerFormModal";
import ArchiveManagerModal from "@/modules/super-admin/components/ArchiveManagerModal";
import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import { Plus, Search } from "lucide-react";

export default function BranchManagers() {
  const { managers, branches, toggleManagerModal } = useSuperAdminStore();
  const activeCount = managers.filter((m) => m.status === "Active").length;
  const archivedCount = managers.filter((m) => m.status === "Archived").length;

  return (
    <>
      <SuperAdminHeader
        title="Branch Managers"
        label="Register and manage managers per branch"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Total Managers
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {managers.length}
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs px-2 py-1 rounded-full text-green-600 bg-green-50 font-medium">
                {activeCount} Active
              </span>
              {archivedCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full text-amber-600 bg-amber-50 font-medium">
                  {archivedCount} Archived
                </span>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Active Branches
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {branches.length}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-[#001F3F] bg-blue-50">
              <span>All Operational</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFD700]/10 rounded-full -mr-8 -mt-8 transition-transform duration-700 ease-in-out group-hover:scale-[25]"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
              Unassigned Branches
            </p>
            <h3 className="text-3xl font-extrabold text-[#001F3F]">
              {
                branches.filter(
                  (b) =>
                    !managers.some(
                      (m) => m.branch === b.name && m.status === "Active"
                    )
                ).length
              }
            </h3>
            <div className="mt-4 flex items-center gap-2 text-xs w-fit px-2 py-1 rounded-full text-slate-500 bg-slate-50">
              <span>Needs assignment</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search managers by name or branch..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
            />
          </div>
          <button
            onClick={toggleManagerModal}
            className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
          >
            <Plus className="size-4 text-[#FFD700]" />
            Register Manager
          </button>
        </div>

        <ManagerTable />
        <ManagerFormModal />
        <ArchiveManagerModal />
      </div>
    </>
  );
}
