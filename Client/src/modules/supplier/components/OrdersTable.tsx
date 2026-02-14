import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { Eye, X, Package, Truck, Calendar, Hash } from "lucide-react";
import { UseOrderState } from "@/modules/supplier/store/UseGetOrders";

const CSV_PDF_HEADERS = [
  "PO Reference",
  "Supplier",
  "Items",
  "Created",
  "ETA",
  "Status",
];

type Order = {
  id: string;
  partner: string;
  items: number;
  created: string;
  eta: string;
  status: string;
};

export default function OrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewTarget, setViewTarget] = useState<Order | null>(null);

  const MOCK_ORDERS = UseOrderState((o) => o.order);
  const totalLength = MOCK_ORDERS.length;
  const displayedData = MOCK_ORDERS.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCSV = () => {
    const rows = MOCK_ORDERS.map((o) => [
      o.id,
      o.partner,
      String(o.items),
      o.created,
      o.eta,
      o.status,
    ]);
    exportToCSV("replenishment-orders", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = MOCK_ORDERS.map((o) => [
      o.id,
      o.partner,
      String(o.items),
      o.created,
      o.eta,
      o.status,
    ]);
    exportToPDF(
      "replenishment-orders",
      "Replenishment Orders Report",
      CSV_PDF_HEADERS,
      rows
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="PO Reference" />
                <HeaderCell label="Supplier" />
                <HeaderCell label="Expected Volume" />
                <HeaderCell label="Created Date" />
                <HeaderCell label="Est. Arrival" />
                <HeaderCell label="Status" />
                <HeaderCell label="Actions" align="right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((order, idx) => (
                <tr
                  key={idx}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
                    <span className="font-mono text-xs font-bold text-[#001F3F] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {order.id}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-slate-700">
                      {order.partner}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-slate-600">
                      {order.items} Units
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-500">
                    {order.created}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-calendar text-slate-400 text-xs"></i>
                      <span className="text-sm font-bold text-[#001F3F]">
                        {order.eta}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setViewTarget(order)}
                      title="View order details"
                      className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
          <Pagination
            currentPage={currentPage}
            totalItems={totalLength}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* --- VIEW ORDER DETAIL MODAL --- */}
      {viewTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
            onClick={() => setViewTarget(null)}
          ></div>
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-[#001F3F]">
                  Order Details
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Purchase Order &middot; {viewTarget.id}
                </p>
              </div>
              <button
                onClick={() => setViewTarget(null)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8">
              {/* PO Badge */}
              <div className="flex items-center justify-center mb-6">
                <span className="font-mono text-lg font-black text-[#001F3F] bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                  {viewTarget.id}
                </span>
              </div>

              {/* Detail rows */}
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Truck className="size-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Supplier
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {viewTarget.partner}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Package className="size-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Volume
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#001F3F]">
                    {viewTarget.items} Units
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Created
                    </span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {viewTarget.created}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Est. Arrival
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#001F3F]">
                    {viewTarget.eta}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-2">
                    <Hash className="size-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      Status
                    </span>
                  </div>
                  <StatusBadge status={viewTarget.status} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setViewTarget(null)}
                className="px-6 py-2 bg-[#001F3F] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#00162e] shadow-md shadow-blue-900/10 transition-all hover:-translate-y-0.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
