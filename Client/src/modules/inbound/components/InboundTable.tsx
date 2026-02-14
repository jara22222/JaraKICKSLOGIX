import { useState } from "react";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";

const CSV_PDF_HEADERS = [
  "Receipt ID",
  "PO Ref",
  "Product",
  "SKU",
  "Qty",
  "Received By",
  "Put-Away By",
  "Location",
  "Status",
];

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
    },
    location: { type: "Overflow", id: "Z-99-01" },
    status: "Flagged",
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

export default function InboundTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalLength = INBOUND_LOGS.length;
  const displayedData = INBOUND_LOGS.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCSV = () => {
    const rows = INBOUND_LOGS.map((log) => [
      log.id,
      log.po_ref,
      log.product,
      log.sku,
      String(log.qty),
      log.received_by.name,
      log.putaway_by.name,
      log.location.id,
      log.status,
    ]);
    exportToCSV("inbound-receiving", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = INBOUND_LOGS.map((log) => [
      log.id,
      log.po_ref,
      log.product,
      log.sku,
      String(log.qty),
      log.received_by.name,
      log.putaway_by.name,
      log.location.id,
      log.status,
    ]);
    exportToPDF("inbound-receiving", "Inbound Receiving Report", CSV_PDF_HEADERS, rows);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <HeaderCell label="Receipt Details" />
                <HeaderCell label="Product Info" />
                <HeaderCell label="Received By" />
                <HeaderCell label="Put-Away By" />
                <HeaderCell label="Bin Location" />
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
                      <span className="text-[10px] text-slate-400 font-mono">{log.po_ref}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{log.product}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1 rounded">
                          {log.sku}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600">x{log.qty}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-100">
                        {log.received_by.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {log.received_by.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.received_by.time}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {log.putaway_by.name !== "Pending" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-700 border border-amber-100">
                          {log.putaway_by.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">
                            {log.putaway_by.name}
                          </span>
                          <span className="text-[10px] text-slate-400">{log.putaway_by.time}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">-- Pending --</span>
                    )}
                  </td>
                  <td className="p-3">
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
