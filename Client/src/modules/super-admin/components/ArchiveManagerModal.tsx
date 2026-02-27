import { useSuperAdminStore } from "@/modules/super-admin/store/UseSuperAdminStore";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Archive, AlertTriangle, X } from "lucide-react";
import { archiveManagerAccount } from "../services/archivemanager";

export default function ArchiveManagerModal() {
  const queryClient = useQueryClient();
  const { archiveConfirmManager, setArchiveConfirmManager } =
    useSuperAdminStore();

  const archiveMutation = useMutation({
    mutationFn: archiveManagerAccount,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Manager archived successfully.");
      queryClient.invalidateQueries({ queryKey: ["superadmin-managers"] });
      setArchiveConfirmManager(null);
    },
  });

  const handleConfirm = () => {
    if (!archiveConfirmManager) return;

    if (
      !archiveConfirmManager.userId ||
      archiveConfirmManager.userId.startsWith("seed-")
    ) {
      showErrorToast("Manager ID is missing. Please refresh the page.");
      return;
    }

    archiveMutation.mutate(archiveConfirmManager.userId);
  };

  const handleCancel = () => {
    setArchiveConfirmManager(null);
  };

  if (!archiveConfirmManager) return null;

  const middleInitial = archiveConfirmManager.middleName?.trim()
    ? ` ${archiveConfirmManager.middleName.trim().charAt(0)}.`
    : "";
  const fullName = `${archiveConfirmManager.firstName}${middleInitial} ${archiveConfirmManager.lastName}`.trim();
  const mgrCode = `MGR-${String(archiveConfirmManager.id).padStart(3, "0")}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[#001F3F]/80 backdrop-blur-sm"
        onClick={handleCancel}
      ></div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-amber-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-[#001F3F]">
              Archive Manager
            </h3>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to archive this manager? Their account will be
            deactivated and they will no longer have access to the system.
          </p>

          {/* Manager card preview */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {archiveConfirmManager.firstName.charAt(0)}
              {archiveConfirmManager.lastName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#001F3F] truncate">
                {fullName}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {mgrCode} &middot; {archiveConfirmManager.branch}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {archiveConfirmManager.email}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <Archive className="size-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Note:</strong> Archived managers can be restored later by
              changing their status back to Active via the edit modal. All their
              historical data and audit logs will be preserved.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-bold text-slate-500 uppercase hover:text-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={archiveMutation.isPending}
            className="px-6 py-2 bg-amber-500 text-white text-xs font-bold uppercase rounded-lg hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Archive className="size-3.5" />
            {archiveMutation.isPending ? "Archiving..." : "Archive Manager"}
          </button>
        </div>
      </div>
    </div>
  );
}
