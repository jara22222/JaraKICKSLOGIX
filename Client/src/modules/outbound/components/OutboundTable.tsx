import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";

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
    status: "Flagged",
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

export default function OutBoundTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalLength = PICKING_LOGS.length;
  const displayedData = PICKING_LOGS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCSV = () => {
    const rows = PICKING_LOGS.map((log) => [
      log.id,
      log.order_ref,
      log.product,
      log.sku,
      String(log.qty_picked),
      log.picked_by.name,
      log.bin_location,
      log.status,
    ]);
    exportToCSV("outbound-picking", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = PICKING_LOGS.map((log) => [
      log.id,
      log.order_ref,
      log.product,
      log.sku,
      String(log.qty_picked),
      log.picked_by.name,
      log.bin_location,
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
              {displayedData.map((log) => (
                <tr
                  key={log.id}
                  className="even:bg-slate-50/50 hover:bg-blue-50/30"
                >
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#001F3F]">{log.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Ref: {log.order_ref}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{log.product}</span>
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded w-fit mt-0.5">
                        {log.sku}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-[10px] font-bold text-purple-700 border border-purple-100">
                        {log.picked_by.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {log.picked_by.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.picked_by.time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-location-crosshairs text-slate-400 text-xs"></i>
                      <span className="text-sm font-mono font-bold text-[#001F3F]">
                        {log.bin_location}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[#001F3F] bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      {log.qty_picked} Pair{log.qty_picked > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={log.status} />
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
