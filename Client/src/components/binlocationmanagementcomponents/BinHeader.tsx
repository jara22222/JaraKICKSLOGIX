import { UseBinState } from "@/zustand/UseBinManagement";
import { Plus, Printer, Search } from "lucide-react";

export default function BinHeader() {
  const setIsAddModalOpen = UseBinState((b) => b.setIsAddModalOpen);
  const handlePrintAll = () => {
    alert("Sending all 5 QR Codes to connected thermal printer...");
  };
  return (
    <>
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-5">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Bin Code (e.g. A-01-05)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#001F3F] focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#001F3F] cursor-pointer">
              <option>All Zones</option>
              <option>Zone A (High Vel)</option>
              <option>Zone B (Bulk)</option>
              <option>Zone C (Returns)</option>
            </select>
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 outline-none focus:border-[#001F3F] cursor-pointer">
              <option>All Statuses</option>
              <option>Active</option>
              <option>Full</option>
              <option>Maintenance</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-[#001F3F] transition-colors shadow-sm font-medium text-sm"
            onClick={handlePrintAll}
          >
            <Printer size={16} /> Print All QRs
          </button>
          <button
            onClick={setIsAddModalOpen}
            className="flex items-center gap-2 px-4 py-2 bg-[#001F3F] text-white rounded-lg hover:bg-[#00162e] transition-all shadow-md active:scale-95 font-medium text-sm"
          >
            <Plus size={16} /> Add New Bin
          </button>
        </div>
      </div>
    </>
  );
}
