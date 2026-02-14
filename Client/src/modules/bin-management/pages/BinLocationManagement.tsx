import AcessControllHeader from "@/shared/layout/Header";
import BinsTable from "@/modules/bin-management/components/BinsTable";
import { UseBinState } from "@/modules/bin-management/store/UseBinManagement";
import { Plus, Printer, Search } from "lucide-react";

export default function BinLocationManagement() {
  const setIsAddModalOpen = UseBinState((b) => b.setIsAddModalOpen);

  const handlePrintAll = () => {
    alert("Sending all QR Codes to connected thermal printer...");
  };

  return (
    <>
      <AcessControllHeader
        title="Bin Management"
        label="Create bin and manage capacity"
      />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-3.5 text-slate-400 size-4 group-focus-within:text-[#001F3F] transition-colors" />
              <input
                type="text"
                placeholder="Search bin code (e.g. A-01-05)..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] transition-all shadow-sm"
              />
            </div>
            <select className="h-[46px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] cursor-pointer shadow-sm">
              <option>All Zones</option>
              <option>Zone A (High Vel)</option>
              <option>Zone B (Bulk)</option>
              <option>Zone C (Returns)</option>
            </select>
            <select className="h-[46px] px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-wider outline-none focus:ring-2 focus:ring-[#001F3F]/20 focus:border-[#001F3F] cursor-pointer shadow-sm">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Full</option>
              <option>Maintenance</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintAll}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Printer className="size-4" />
              Print All QRs
            </button>
            <button
              onClick={setIsAddModalOpen}
              className="px-6 py-2.5 bg-[#001F3F] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#00162e] shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              <Plus className="size-4 text-[#FFD700]" />
              Add New Bin
            </button>
          </div>
        </div>

        <BinsTable />
      </div>
    </>
  );
}
