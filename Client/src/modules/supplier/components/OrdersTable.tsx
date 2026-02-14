import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { UseOrderState } from "@/modules/supplier/store/UseGetOrders";

const CSV_PDF_HEADERS = ["PO Reference", "Supplier", "Items", "Created", "ETA", "Status"];

export default function OrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const MOCK_ORDERS = UseOrderState((o) => o.order);
  const totalLength = MOCK_ORDERS.length;
  const displayedData = MOCK_ORDERS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    exportToPDF("replenishment-orders", "Replenishment Orders Report", CSV_PDF_HEADERS, rows);
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
                <HeaderCell label="" align="right" />
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
                    <span className="text-sm font-bold text-slate-700">{order.partner}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-slate-600">
                      {order.items} Units
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-500">{order.created}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <i className="fa-regular fa-calendar text-slate-400 text-xs"></i>
                      <span className="text-sm font-bold text-[#001F3F]">{order.eta}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-right">
                    <button className="px-3 py-1 text-xs font-bold text-[#001F3F] border border-[#001F3F] rounded hover:bg-[#001F3F] hover:text-white">
                      View
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
    </>
  );
}
