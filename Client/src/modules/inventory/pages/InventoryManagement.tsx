import AcessControllHeader from "@/shared/layout/Header";
import DateFilter from "@/shared/components/DateFilter";
import InvetorTable from "@/modules/inventory/components/InventoryTable";
import SearchToolBar from "@/shared/components/SearchToolBar";
import { useState } from "react";

export default function InventoryManagement() {
  const [filterStatus, setFilterStatus] = useState("All");

  return (
    <>
      <AcessControllHeader title="Inventory" label="Item Inventory" />
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 mb-6">
          {/* Status Filter */}
          <div className="flex h-12 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {["All", "Occupied", "Available"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${filterStatus === status ? "bg-white text-[#001F3F] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <SearchToolBar />
            <DateFilter />
          </div>
        </div>
        <InvetorTable />
      </div>
    </>
  );
}
