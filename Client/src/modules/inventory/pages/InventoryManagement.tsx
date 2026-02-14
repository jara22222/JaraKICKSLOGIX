import AcessControllHeader from "@/shared/layout/Header";
import DateFilter from "@/shared/components/DateFilter";
import InvetorTable from "@/modules/inventory/components/InventoryTable";
import SearchToolBar from "@/shared/components/SearchToolBar";
import { useState } from "react";

export default function InventoryManagement() {
  const [filterStatus, setFilterStatus] = useState("All");

  return (
    <>
      <AcessControllHeader title="Inventory" label="Item inventory" />
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          {/* Status Filter Pills */}
          <div className="flex h-[46px] bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {["All", "Occupied", "Available"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  filterStatus === status
                    ? "bg-[#001F3F] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <SearchToolBar placeholder="Search product or SKU..." />
            <DateFilter />
          </div>
        </div>
        <InvetorTable />
      </div>
    </>
  );
}
