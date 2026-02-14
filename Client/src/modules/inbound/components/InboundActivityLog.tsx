import { useInboundStore } from "@/modules/inbound/store/UseInboundStore";
import Pagination from "@/shared/components/Pagination";
import ExportToolbar from "@/shared/components/ExportToolbar";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { useState } from "react";

const ACTION_STYLES: Record<string, string> = {
  ACCEPT: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PUT_AWAY: "bg-blue-50 text-blue-700 border-blue-200",
  ALERT: "bg-red-50 text-red-600 border-red-200",
  FLAG: "bg-amber-50 text-amber-700 border-amber-200",
};

export default function InboundActivityLog() {
  const { activityLog } = useInboundStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = activityLog.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportHeaders = ["ID", "User", "Action", "Description", "Timestamp"];
  const exportRows = activityLog.map((a) => [
    a.id,
    a.user,
    a.action,
    a.description,
    a.timestamp,
  ]);

  const handleCSV = () =>
    exportToCSV("inbound-activity-log", exportHeaders, exportRows);
  const handlePDF = () =>
    exportToPDF(
      "inbound-activity-log",
      "Inbound Activity Log",
      exportHeaders,
      exportRows
    );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Activity list */}
      <div className="divide-y divide-slate-100">
        {paginatedData.map((entry) => (
          <div
            key={entry.id}
            className="p-4 hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                  {entry.user === "System"
                    ? "SYS"
                    : entry.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-[#001F3F]">
                      {entry.user}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        ACTION_STYLES[entry.action] ||
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {entry.action.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {entry.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {entry.description}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                {entry.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <ExportToolbar onExportCSV={handleCSV} onExportPDF={handlePDF} />
        <Pagination
          currentPage={currentPage}
          totalItems={activityLog.length}
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
