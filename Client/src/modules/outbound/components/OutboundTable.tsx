import { ChevronLeft, ChevronRight } from "lucide-react";

import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";

export default function OutBoundTable() {
  // --- MOCK DATA ---

  const PICKING_LOGS = [
    {
      id: "PICK-7701",
      order_ref: "ORD-5501",
      sku: "NK-AIR-001",
      product: "Air Jordan 1 High",
      qty_picked: 1,
      picked_by: {
        name: "Jara Joaquin",
        role: "Outbound Clerk",
        time: "02:15 PM",
      },
      bin_location: "A-01-05",
      status: "Verified",
    },
    {
      id: "PICK-7702",
      order_ref: "ORD-5502",
      sku: "AD-UB-22",
      product: "Adidas Ultraboost",
      qty_picked: 2,
      picked_by: {
        name: "Kobe Bryant",
        role: "Outbound Clerk",
        time: "02:20 PM",
      },
      bin_location: "C-05-02",
      status: "Verified",
    },
    {
      id: "PICK-7703",
      order_ref: "ORD-5503",
      sku: "NK-DUNK-044",
      product: "Nike Dunk Low",
      qty_picked: 1,
      picked_by: {
        name: "Jara Joaquin",
        role: "Outbound Clerk",
        time: "02:35 PM",
      },
      bin_location: "B-02-12",
      status: "Flagged", // E.g., Wrong item scanned initially
    },
    {
      id: "PICK-7704",
      order_ref: "ORD-5504",
      sku: "PM-RSX-009",
      product: "Puma RS-X",
      qty_picked: 1,
      picked_by: {
        name: "Kobe Bryant",
        role: "Outbound Clerk",
        time: "03:00 PM",
      },
      bin_location: "C-05-01",
      status: "Verified",
    },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <HeaderCell label="Pick ID / Order" />
                <HeaderCell label="Item Details" />
                <HeaderCell label="Retrieved By (Picker)" />
                <HeaderCell label="Source Bin" />
                <HeaderCell label="Qty Retrieved" />
                <HeaderCell label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PICKING_LOGS.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Column 1: ID Info */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {log.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {log.order_ref}
                      </span>
                    </div>
                  </td>

                  {/* Column 2: Product */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {log.product}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded w-fit mt-0.5">
                        {log.sku}
                      </span>
                    </div>
                  </td>

                  {/* Column 3: Who Retrieved It */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-[10px] font-bold text-purple-700 border border-purple-100">
                        {log.picked_by.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {log.picked_by.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.picked_by.time}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Bin Location */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-location-crosshairs text-slate-400 text-xs"></i>
                      <span className="text-sm font-mono font-bold text-[#001F3F]">
                        {log.bin_location}
                      </span>
                    </div>
                  </td>

                  {/* Column 5: Quantity */}
                  <td className="p-4">
                    <span className="text-sm font-bold text-[#001F3F] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {log.qty_picked} Pair{log.qty_picked > 1 ? "s" : ""}
                    </span>
                  </td>

                  {/* Column 6: Status */}
                  <td className="p-4">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Showing {PICKING_LOGS.length} of 42 staff members
          </span>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-left">
                <ChevronLeft className="size-4" />
              </i>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#001F3F] text-white text-xs font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-[#001F3F] text-xs">
              <i className="fa-solid fa-chevron-right">
                <ChevronRight className="size-4" />
              </i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
