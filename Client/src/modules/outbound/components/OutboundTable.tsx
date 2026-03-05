import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { useQuery } from "@tanstack/react-query";
import { getBranchOutboundLogs } from "@/modules/outbound/services/branchManagerOrder";

const CSV_PDF_HEADERS = [
  "Pick ID",
  "Order Ref",
  "Product",
  "SKU",
  "Qty",
  "Picked By",
  "Bin",
  "Status",
];

export default function OutBoundTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: pickingLogs = [], isLoading } = useQuery({
    queryKey: ["branch-manager-outbound-logs"],
    queryFn: getBranchOutboundLogs,
    retry: false,
  });

  const totalLength = pickingLogs.length;
  const displayedData = pickingLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCSV = () => {
    const rows = pickingLogs.map((log) => [
      log.pickId,
      log.orderRef,
      log.product,
      log.sku,
      String(log.qtyPicked),
      log.pickedByName,
      log.binLocation,
      log.status,
    ]);
    exportToCSV("outbound-picking", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = pickingLogs.map((log) => [
      log.pickId,
      log.orderRef,
      log.product,
      log.sku,
      String(log.qtyPicked),
      log.pickedByName,
      log.binLocation,
      log.status,
    ]);
    exportToPDF("outbound-picking", "Outbound Picking Report", CSV_PDF_HEADERS, rows);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Pick ID / Order" />
                <HeaderCell label="Item Details" />
                <HeaderCell label="Retrieved By (Picker)" />
                <HeaderCell label="Source Bin" />
                <HeaderCell label="Qty Retrieved" />
                <HeaderCell label="Status" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-sm text-slate-500 text-center">
                    Loading outbound logs...
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-sm text-slate-500 text-center">
                    No outbound logs found.
                  </td>
                </tr>
              ) : (
                displayedData.map((log) => (
                <tr
                  key={log.pickId}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3F]">{log.pickId}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {log.orderRef}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{log.product}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded w-fit mt-0.5 dark:bg-[#243a5c] dark:text-slate-100">
                        {log.sku}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-[10px] font-bold text-purple-700 border border-purple-100">
                        {log.pickedByName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {log.pickedByName}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.pickedByTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-location-crosshairs text-slate-400 text-xs"></i>
                      <span className="text-sm font-mono font-bold text-[#001F3F]">
                        {log.binLocation}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[#001F3F] bg-blue-50 px-2 py-1 rounded border border-blue-100 dark:bg-[#243a5c] dark:border-[#36507a] dark:text-slate-100">
                      {log.qtyPicked} Pair{log.qtyPicked > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={log.status} />
                  </td>
                </tr>
                ))
              )}
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
