import HeaderCell from "@/shared/components/HeaderCell";
import ExportToolbar from "@/shared/components/ExportToolbar";
import Pagination from "@/shared/components/Pagination";
import { exportToCSV, exportToPDF } from "@/shared/lib/exportUtils";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import {
  restoreBranchEmployee,
  type BranchEmployee,
} from "@/modules/access-control/services/branchEmployee";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import ConfirmationModal from "@/shared/components/ConfirmationModal";

const toDisplayName = (employee: BranchEmployee) =>
  `${employee.firstName} ${employee.middleName ? `${employee.middleName}. ` : ""}${employee.lastName}`
    .replace(/\s+/g, " ")
    .trim();

export default function ArchivedBranchUsersTable({
  employees,
}: {
  employees: BranchEmployee[];
}) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [restoreTarget, setRestoreTarget] = useState<BranchEmployee | null>(null);

  const restoreMutation = useMutation({
    mutationFn: restoreBranchEmployee,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Employee restored successfully.");
      void queryClient.invalidateQueries({ queryKey: ["branch-archived-employees"] });
      void queryClient.invalidateQueries({ queryKey: ["branch-employees"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to restore employee.");
    },
  });

  const paginatedData = employees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const exportHeaders = ["Name", "Email", "Role", "Branch", "Status"];
  const exportRows = employees.map((employee) => [
    toDisplayName(employee),
    employee.email,
    employee.roleName,
    employee.branch,
    employee.status,
  ]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <HeaderCell label="User Details" />
              <HeaderCell label="Role" />
              <HeaderCell label="Branch" />
              <HeaderCell label="Status" />
              <HeaderCell label="Actions" align="right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500 text-center">
                  No archived users found.
                </td>
              </tr>
            )}
            {paginatedData.map((employee) => (
              <tr key={employee.id} className="even:bg-slate-50/50 hover:bg-amber-50/30">
                <td className="p-3">
                  <div>
                    <p className="text-sm font-bold text-[#001F3F]">{toDisplayName(employee)}</p>
                    <p className="text-xs text-slate-400">{employee.email}</p>
                  </div>
                </td>
                <td className="p-3 text-sm font-medium text-slate-700">{employee.roleName}</td>
                <td className="p-3 text-sm text-slate-700">{employee.branch || "N/A"}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-700 border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
                    {employee.status || "Archived"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setRestoreTarget(employee)}
                    disabled={restoreMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw className="size-3.5" />
                    Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <ExportToolbar
          onExportCSV={() => exportToCSV("archived_branch_users", exportHeaders, exportRows)}
          onExportPDF={() =>
            exportToPDF(
              "archived_branch_users",
              "Archived Branch Users Report",
              exportHeaders,
              exportRows,
            )
          }
        />
        <Pagination
          currentPage={currentPage}
          totalItems={employees.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <ConfirmationModal
        isOpen={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={() => {
          if (!restoreTarget || restoreMutation.isPending) return;
          restoreMutation.mutate(restoreTarget.id, {
            onSuccess: () => setRestoreTarget(null),
          });
        }}
        title="Restore User"
        description="Are you sure you want to restore this archived branch user?"
        confirmLabel={restoreMutation.isPending ? "Restoring..." : "Restore User"}
        confirmVariant="primary"
        confirmIcon={<RotateCcw className="size-3.5" />}
      >
        {restoreTarget && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-sm font-bold text-[#001F3F]">{toDisplayName(restoreTarget)}</p>
            <p className="text-xs text-slate-500">{restoreTarget.roleName}</p>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
}
