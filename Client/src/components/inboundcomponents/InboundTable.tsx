import { ChevronLeft, ChevronRight } from "lucide-react";
import { UsePartnerState } from "@/zustand/UseGetPartner";
import HeaderCell from "../suppliermanagementcomponents/suppliertableComponents/HeaderCell";
import StatusBadge from "../suppliermanagementcomponents/suppliertableComponents/StatusBadge";
export default function InboundTable() {
  // --- MOCK DATA ---
  const MOCK_PARTNERS = UsePartnerState((s) => s.partner);
  const INBOUND_LOGS = [
    {
      id: "RCPT-8821",
      po_ref: "PO-2026-001",
      sku: "NK-AIR-001",
      product: "Air Jordan 1 High",
      qty: 50,
      received_by: {
        name: "LeBron James",
        role: "Inbound Clerk",
        time: "08:15 AM",
      },
      putaway_by: {
        name: "LeBron James",
        role: "Inbound Clerk",
        time: "08:30 AM",
      },
      location: { type: "Fixed-Bin", id: "A-01-05" },
      status: "Stored",
    },
    {
      id: "RCPT-8822",
      po_ref: "PO-2026-001",
      sku: "NK-DUNK-044",
      product: "Nike Dunk Low",
      qty: 100,
      received_by: {
        name: "LeBron James",
        role: "Inbound Clerk",
        time: "08:45 AM",
      },
      putaway_by: {
        name: "Kevin Durant",
        role: "VAS / Handler",
        time: "09:10 AM",
      }, // Different person example
      location: { type: "Overflow", id: "Z-99-01" },
      status: "Flagged", // Maybe bin was full
    },
    {
      id: "RCPT-8823",
      po_ref: "PO-2026-002",
      sku: "AD-UB-22",
      product: "Adidas Ultraboost",
      qty: 200,
      received_by: {
        name: "Stephen Curry",
        role: "Inbound Clerk",
        time: "10:00 AM",
      },
      putaway_by: { name: "Pending", role: "-", time: "-" },
      location: { type: "Staging", id: "Dock-02" },
      status: "Receiving",
    },
    {
      id: "RCPT-8824",
      po_ref: "PO-2026-003",
      sku: "PM-RSX-009",
      product: "Puma RS-X",
      qty: 75,
      received_by: {
        name: "Stephen Curry",
        role: "Inbound Clerk",
        time: "11:20 AM",
      },
      putaway_by: {
        name: "Stephen Curry",
        role: "Inbound Clerk",
        time: "11:35 AM",
      },
      location: { type: "Fixed-Bin", id: "C-05-01" },
      status: "Stored",
    },
  ];
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <HeaderCell label="Receipt Details" />
                <HeaderCell label="Product Info" />
                <HeaderCell label="Received By" />
                <HeaderCell label="Put-Away By" />
                <HeaderCell label="Bin Location" />
                <HeaderCell label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {INBOUND_LOGS.map((log) => (
                <tr
                  key={log.id}
                  className="group hover:bg-slate-50/80 transition-colors"
                >
                  {/* Column 1: Receipt Details */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {log.id}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.po_ref}
                      </span>
                    </div>
                  </td>
                  {/* Column 2: Product Info */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {log.product}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded">
                          {log.sku}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">
                          x{log.qty}
                        </span>
                      </div>
                    </div>
                  </td>
                  {/* Column 3: Received By (Who verified intake) */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-100">
                        {log.received_by.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {log.received_by.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.received_by.time}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Column 4: Put-Away By (Who verified storage) */}
                  <td className="p-4">
                    {log.putaway_by.name !== "Pending" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-700 border border-amber-100">
                          {log.putaway_by.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">
                            {log.putaway_by.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {log.putaway_by.time}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        -- Pending --
                      </span>
                    )}
                  </td>

                  {/* Column 5: Location Context */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <i
                        className={`fa-solid ${log.location.type === "Fixed-Bin" ? "fa-box-archive text-[#001F3F]" : "fa-dolly text-slate-400"} text-xs`}
                      ></i>
                      <div className="flex flex-col">
                        <span className="text-sm font-mono font-bold text-[#001F3F]">
                          {log.location.id}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase">
                          {log.location.type}
                        </span>
                      </div>
                    </div>
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
            Showing {MOCK_PARTNERS.length} of 42 staff members
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
