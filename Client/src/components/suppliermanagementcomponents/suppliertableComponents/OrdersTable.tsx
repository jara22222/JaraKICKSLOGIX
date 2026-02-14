import { ChevronLeft, ChevronRight } from "lucide-react";
import HeaderCell from "./HeaderCell";
import StatusBadge from "./StatusBadge";
import { UseOrderState } from "@/zustand/UseGetOrders";

export default function OrdersTable() {
  const MOCK_ORDERS = UseOrderState((o) => o.order);
  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <HeaderCell label="PO Reference" />
                <HeaderCell label="Supplier" />
                <HeaderCell label="Expected Volume" />
                <HeaderCell label="Created Date" />
                <HeaderCell label="Est. Arrival" />
                <HeaderCell label="Status" />
                <HeaderCell label="" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_ORDERS.map((order, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-5">
                    <span className="font-mono text-xs font-bold text-[#001F3F] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {order.id}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-bold text-slate-700">
                      {order.partner}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="text-sm font-medium text-slate-600">
                      {order.items} Units
                    </span>
                  </td>
                  <td className="p-5 text-sm text-slate-500">
                    {order.created}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-calendar text-slate-400 text-xs"></i>
                      <span className="text-sm font-bold text-[#001F3F]">
                        {order.eta}
                      </span>
                    </div>
                  </td>
                  <td className="p-5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-5 text-right">
                    <button className="px-3 py-1 text-xs font-bold text-[#001F3F] border border-[#001F3F] rounded hover:bg-[#001F3F] hover:text-white transition-colors">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            Showing {MOCK_ORDERS.length} of 42 orders
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
