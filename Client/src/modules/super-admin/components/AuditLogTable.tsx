import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { useState } from "react";

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-blue-50 text-blue-700 border-blue-200",
  UPDATE: "bg-indigo-50 text-indigo-700 border-indigo-200",
  ARCHIVE: "bg-amber-50 text-amber-700 border-amber-200",
  RESTORE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CREATE_MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
  CREATE_STAFF: "bg-blue-50 text-blue-700 border-blue-200",
  RECEIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PUT_AWAY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PICK: "bg-amber-50 text-amber-700 border-amber-200",
  DISPATCH: "bg-purple-50 text-purple-700 border-purple-200",
  ALERT: "bg-red-50 text-red-600 border-red-200",
  APPROVE: "bg-blue-50 text-blue-700 border-blue-200",
  PACK: "bg-amber-50 text-amber-700 border-amber-200",
  REGISTER_SUPPLIER: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const normalizeAction = (action: string) =>
  action
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toUpperCase();

const getActionLabel = (action: string) =>
  action
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function AuditLogTable({
  logs,
}: {
  logs: {
    id: string;
    userId: string;
    userName: string;
    action: string;
    description: string;
    branch: string;
    datePerformed: string;
  }[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedData = logs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exportHeaders = [
    "Count",
    "User",
    "User ID",
    "Action",
    "Description",
    "Branch",
    "Timestamp",
  ];
  const exportRows = logs.map((log, index) => [
    String(index + 1),
    log.userName,
    log.userId,
    log.action.replace(/_/g, " "),
    log.description,
    log.branch,
    log.datePerformed,
  ]);

  const handleExportCSV = () =>
    exportToCSV("Audit_Log", exportHeaders, exportRows);

  const handleExportPDF = () =>
    exportToPDF("Audit_Log", "Audit Log Report", exportHeaders, exportRows);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <HeaderCell label="#" />
              <HeaderCell label="User" />
              <HeaderCell label="Action" />
              <HeaderCell label="Description" />
              <HeaderCell label="Branch" />
              <HeaderCell label="Timestamp" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((log, index) => (
              <tr
                key={log.id}
                className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
              >
                <td className="p-3">
                  <span className="text-xs font-bold text-[#001F3F]">
                    {(currentPage - 1) * pageSize + index + 1}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[10px]">
                      {log.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {log.userName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {log.userId}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ACTION_STYLES[normalizeAction(log.action)] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {getActionLabel(log.action)}
                  </span>
                </td>
                <td className="p-3 max-w-[300px]">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.description}
                  </p>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      log.branch === "Super Admin"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {log.branch || "Super Admin"}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(log.datePerformed).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center">
                  <p className="text-sm text-slate-400">
                    No logs found for the selected filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <ExportToolbar onExportCSV={handleExportCSV} onExportPDF={handleExportPDF} />
        <Pagination
          currentPage={currentPage}
          totalItems={logs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
