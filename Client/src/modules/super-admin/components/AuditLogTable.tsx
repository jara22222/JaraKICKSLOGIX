import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { useState } from "react";

const ACTION_STYLES: Record<string, string> = {
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

export default function AuditLogTable({
  branchFilter,
  actionFilter,
}: {
  branchFilter: string;
  actionFilter: string;
}) {
  const auditLogs = useSuperAdminStore((s) => s.auditLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = auditLogs.filter((log) => {
    const branchMatch =
      branchFilter === "All" || log.branch === branchFilter;
    const actionMatch =
      actionFilter === "All" || log.action === actionFilter;
    return branchMatch && actionMatch;
  });

  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exportHeaders = [
    "Log ID",
    "User",
    "User ID",
    "Action",
    "Description",
    "Branch",
    "Timestamp",
  ];
  const exportRows = filtered.map((log) => [
    log.id,
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
              <HeaderCell label="Log ID" />
              <HeaderCell label="User" />
              <HeaderCell label="Action" />
              <HeaderCell label="Description" />
              <HeaderCell label="Branch" />
              <HeaderCell label="Timestamp" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((log) => (
              <tr
                key={log.id}
                className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
              >
                <td className="p-3">
                  <span className="font-mono text-xs font-bold text-[#001F3F] bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    {log.id}
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
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ACTION_STYLES[log.action] || "bg-slate-50 text-slate-600 border-slate-200"}`}
                  >
                    {log.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="p-3 max-w-[300px]">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {log.description}
                  </p>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-600 border-slate-200">
                    {log.branch}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {log.datePerformed}
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
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
