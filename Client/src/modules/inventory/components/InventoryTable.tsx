import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { useQuery } from "@tanstack/react-query";
import { getInventoryItems } from "@/modules/inventory/services/inventory";
import {
  formatInboundStatus,
  getInboundStatusBadgeClass,
} from "@/modules/inbound/utils/statusFormat";

const CSV_PDF_HEADERS = [
  "Bin Location",
  "Product Name",
  "Status",
  "SKU",
  "Size",
  "Quantity",
];

export default function InvetorTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: inventoryItems = [], isLoading } = useQuery({
    queryKey: ["branch-manager-inventory-items"],
    queryFn: getInventoryItems,
    retry: false,
  });

  const totalLength = inventoryItems.length;
  const displayedData = inventoryItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleCSV = () => {
    const rows = inventoryItems.map((item) => [
      item.binLocation,
      item.productName,
      formatInboundStatus(item.status),
      item.sku,
      item.size,
      String(item.quantity),
    ]);
    exportToCSV("inventory", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = inventoryItems.map((item) => [
      item.binLocation,
      item.productName,
      formatInboundStatus(item.status),
      item.sku,
      item.size,
      String(item.quantity),
    ]);
    exportToPDF("inventory", "Inventory Report", CSV_PDF_HEADERS, rows);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Bin Location" />
                <HeaderCell label="Product Name" />
                <HeaderCell label="Status" />
                <HeaderCell label="SKU" />
                <HeaderCell label="Size" />
                <HeaderCell label="Quantity" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-sm text-slate-500">
                    Loading inventory...
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-sm text-slate-500">
                    No inventory items found.
                  </td>
                </tr>
              ) : (
                displayedData.map((item) => (
                  <tr
                    key={`${item.sku}-${item.binLocation}-${item.size}`}
                    className="even:bg-slate-50/50 hover:bg-blue-50/30"
                  >
                    <td className="p-3">
                      <span className="text-sm font-mono font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                        {item.binLocation}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-medium text-slate-700">
                        {item.productName}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getInboundStatusBadgeClass(
                          item.status,
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                        {formatInboundStatus(item.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.sku}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                        {item.size}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#001F3F]">
                        {item.quantity.toLocaleString()}
                      </span>
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
