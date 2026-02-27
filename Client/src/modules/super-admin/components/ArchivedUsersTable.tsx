import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { restoreManagerAccount } from "../services/restoremanager";

type ArchivedManagerItem = {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  branch: string;
  createdAt: string;
};

const getManagerDisplayName = (manager: ArchivedManagerItem) => {
  const middleInitial = manager.middleName?.trim()
    ? ` ${manager.middleName.trim().charAt(0)}.`
    : "";
  return `${manager.firstName}${middleInitial} ${manager.lastName}`.trim();
};

export default function ArchivedUsersTable({
  managers,
}: {
  managers: ArchivedManagerItem[];
}) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const restoreMutation = useMutation({
    mutationFn: restoreManagerAccount,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Manager restored successfully.");
      queryClient.invalidateQueries({ queryKey: ["superadmin-archived-managers"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-managers"] });
    },
  });

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

  const exportRows = managers.map((manager, index) => [
    `MGR-${String(index + 1).padStart(3, "0")}`,
    getManagerDisplayName(manager),
    manager.branch?.trim() ? manager.branch : "N/A",
    manager.email,
    "Archived",
    manager.createdAt || "N/A",
  ]);

  const handleExportCSV = () =>
    exportToCSV("Archived_Managers", exportHeaders, exportRows);

  const handleExportPDF = () =>
    exportToPDF(
      "Archived_Managers",
      "Archived Managers Report",
      exportHeaders,
      exportRows,
    );

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
            {paginatedData.map((manager, index) => (
              <tr
                key={manager.id}
                className="even:bg-slate-50/50 hover:bg-amber-50/20 border-l-2 border-l-transparent"
              >
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
                      {manager.firstName.charAt(0)}
                      {manager.lastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#001F3F]">
                        {getManagerDisplayName(manager)}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        MGR-{String(index + 1).padStart(3, "0")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                    {manager.branch?.trim() ? manager.branch : "N/A"}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-sm text-slate-600">{manager.email}</span>
                </td>
                <td className="p-3">
                  <span className="text-xs text-slate-500">
                    {manager.createdAt || "N/A"}
                  </span>
                </td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    Archived
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => restoreMutation.mutate(manager.id)}
                    disabled={restoreMutation.isPending}
                    title="Revert to active"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="size-3.5" />
                    Revert
                  </button>
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
