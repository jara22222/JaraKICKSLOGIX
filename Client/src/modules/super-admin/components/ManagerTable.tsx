import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import type { Manager } from "@/modules/super-admin/store/UseSuperAdminStore";
import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { Pencil, Archive } from "lucide-react";
import { useState } from "react";

export default function ManagerTable({ managers }: { managers: Manager[] }) {
  const { openEditManager, setArchiveConfirmManager } = useSuperAdminStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const getManagerDisplayName = (mgr: (typeof managers)[number]) => {
    const middleInitial = mgr.middleName?.trim()
      ? ` ${mgr.middleName.trim().charAt(0)}.`
      : "";
    return `${mgr.firstName}${middleInitial} ${mgr.lastName}`.trim();
  };

  const getRegisteredDateDisplay = (createdAt?: string) =>
    createdAt?.trim() ? createdAt : "N/A";

  const paginatedData = managers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const exportHeaders = [
    "ID",
    "Name",
    "Branch",
    "Email",
    "Status",
    "Registered",
  ];
  const exportRows = managers.map((mgr) => [
    `MGR-${String(mgr.id).padStart(3, "0")}`,
    getManagerDisplayName(mgr),
    mgr.branch?.trim() ? mgr.branch : "N/A",
    mgr.email,
    mgr.status,
    getRegisteredDateDisplay(mgr.createdAt),
  ]);

  const handleExportCSV = () =>
    exportToCSV("Branch_Managers", exportHeaders, exportRows);

  const handleExportPDF = () =>
    exportToPDF(
      "Branch_Managers",
      "Branch Managers Report",
      exportHeaders,
      exportRows,
    );

  const statusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border-green-200";
      case "Archived":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <HeaderCell label="Manager Details" />
              <HeaderCell label="Branch Assignment" />
              <HeaderCell label="Email" />
              <HeaderCell label="Date Registered" />
              <HeaderCell label="Status" />
              <HeaderCell label="Actions" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((mgr) => (
              <tr
                key={mgr.id}
                className="even:bg-slate-50/50 hover:bg-blue-50/30 hover:border-l-2 hover:border-l-[#001F3F] border-l-2 border-l-transparent"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {mgr.firstName.charAt(0)}
                      {mgr.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {getManagerDisplayName(mgr)}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        MGR-{String(mgr.id).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                    {mgr.branch?.trim() ? mgr.branch : "N/A"}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-slate-600">{mgr.email}</span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-slate-500">
                    {getRegisteredDateDisplay(mgr.createdAt)}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyles(mgr.status)}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    {mgr.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditManager(mgr)}
                      title="Edit manager"
                      className="p-2 text-slate-400 hover:text-[#001F3F] hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Pencil className="size-4" />
                    </button>
                    {mgr.status !== "Archived" && (
                      <button
                        onClick={() => setArchiveConfirmManager(mgr)}
                        title="Archive manager"
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Archive className="size-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <ExportToolbar
          onExportCSV={handleExportCSV}
          onExportPDF={handleExportPDF}
        />
        <Pagination
          currentPage={currentPage}
          totalItems={managers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
