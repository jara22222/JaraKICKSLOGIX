import { useState } from "react";
import { useInboundStore } from "@/modules/inbound/store/UseInboundStore";
import HeaderCell from "@/shared/components/HeaderCell";
import StatusBadge from "@/shared/components/StatusBadge";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { Archive, MapPin } from "lucide-react";

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

export default function InboundTable() {
  const { receipts } = useInboundStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalLength = receipts.length;
  const displayedData = receipts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCSV = () => {
    const rows = receipts.map((log) => [
      log.id,
      log.poRef,
      log.product,
      log.sku,
      String(log.qty),
      log.receivedBy.name,
      log.putawayBy.name,
      log.location.id,
      log.status,
    ]);
    exportToCSV("inbound-receiving", CSV_PDF_HEADERS, rows);
  };

  const handlePDF = () => {
    const rows = receipts.map((log) => [
      log.id,
      log.poRef,
      log.product,
      log.sku,
      String(log.qty),
      log.receivedBy.name,
      log.putawayBy.name,
      log.location.id,
      log.status,
    ]);
    exportToPDF(
      "inbound-receiving",
      "Inbound Receiving Report",
      CSV_PDF_HEADERS,
      rows
    );
  };

  return (
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
                className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
              >
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#001F3F]">
                      {log.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.poRef}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">
                      {log.product}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.sku}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        x{log.qty}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-700 border border-blue-100">
                      {log.receivedBy.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">
                        {log.receivedBy.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {log.receivedBy.time}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  {log.putawayBy.name !== "Pending" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-700 border border-amber-100">
                        {log.putawayBy.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {log.putawayBy.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.putawayBy.time}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      -- Pending --
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {log.location.type === "Fixed-Bin" ? (
                      <Archive className="size-4 text-[#001F3F]" />
                    ) : (
                      <MapPin className="size-4 text-slate-400" />
                    )}
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
  );
}
