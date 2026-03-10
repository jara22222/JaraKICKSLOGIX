import {
  confirmBranchPasswordResetRequest,
  getBranchPasswordResetRequests,
  rejectBranchPasswordResetRequest,
  type BranchPasswordResetRequest,
} from "@/modules/access-control/services/branchEmployee";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { X } from "lucide-react";

const statusClassMap: Record<string, string> = {
  PendingApproval: "bg-amber-100 text-amber-700 border-amber-200",
  Approved: "bg-blue-100 text-blue-700 border-blue-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
  Completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PasswordResetRequestsTable() {
  const queryClient = useQueryClient();
  const [viewTarget, setViewTarget] = useState<BranchPasswordResetRequest | null>(null);
  const { data: requests = [], isLoading, isError } = useQuery({
    queryKey: ["branch-password-reset-requests"],
    queryFn: getBranchPasswordResetRequests,
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: (requestId: string) => confirmBranchPasswordResetRequest(requestId),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Reset link sent to employee email.");
      if (data.emailSent === false && data.emailWarning) {
        showErrorToast(`Email not sent: ${data.emailWarning}`);
      }
      if (data.resetLinkPreview) {
        void navigator.clipboard
          .writeText(data.resetLinkPreview)
          .then(() => showSuccessToast("Reset link preview copied to clipboard."))
          .catch(() => showErrorToast(`Reset link preview: ${data.resetLinkPreview}`));
      }
      void queryClient.invalidateQueries({ queryKey: ["branch-password-reset-requests"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to confirm request.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectBranchPasswordResetRequest(requestId),
    onSuccess: (data) => {
      showSuccessToast(data.message || "Request rejected.");
      void queryClient.invalidateQueries({ queryKey: ["branch-password-reset-requests"] });
    },
    onError: (error: any) => {
      showErrorToast(error?.response?.data?.message || "Failed to reject request.");
    },
  });

  const currentBranch = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return "";
      const parsed = JSON.parse(rawUser);
      const branch = parsed?.branch ?? parsed?.Branch;
      return typeof branch === "string" ? branch.trim() : "";
    } catch {
      return "";
    }
  }, []);

  const rows: BranchPasswordResetRequest[] = useMemo(() => {
    if (!currentBranch) return requests;
    return requests.filter(
      (request) =>
        String(request.branch ?? "").trim().toLowerCase() === currentBranch.toLowerCase(),
    );
  }, [currentBranch, requests]);

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-[#001F3F] uppercase tracking-wide">
          Password Reset Verification Queue
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Review branch user details, then approve to send reset link to registered email.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Employee
              </th>
              <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Submitted Details
              </th>
              <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Requested At
              </th>
              <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Status
              </th>
              <th className="p-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500">
                  Loading password reset requests...
                </td>
              </tr>
            )}
            {!isLoading && isError && (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-red-600">
                  Unable to load requests right now.
                </td>
              </tr>
            )}
            {!isLoading && !isError && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-sm text-slate-500">
                  No password reset requests yet.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              rows.map((request) => {
                return (
                  <tr key={request.requestId} className="even:bg-slate-50/50">
                    <td className="p-3">
                      <p className="text-sm font-bold text-[#001F3F]">
                        {request.userName || request.userEmail}
                      </p>
                      <p className="text-xs text-slate-500">{request.userEmail}</p>
                      <p className="text-[10px] text-slate-400 uppercase mt-1">
                        {request.requestedRoleName || "-"}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-slate-700">
                        {(request.requestedByFirstName || request.requestedByLastName)
                          ? `${request.requestedByFirstName} ${request.requestedByLastName}`.trim()
                          : "-"}
                      </p>
                      <p className="text-xs text-slate-500">{request.requestedByEmail}</p>
                      <p className="text-[10px] text-slate-400">{request.requestedByAddress}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-xs text-slate-700">{formatDateTime(request.requestedAt)}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Reviewed: {formatDateTime(request.reviewedAt)}
                      </p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          statusClassMap[request.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {request.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {request.reviewedByUserName || "-"}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setViewTarget(request)}
                        className="px-3 py-1.5 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {viewTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#001F3F]/75 backdrop-blur-sm"
            onClick={() => setViewTarget(null)}
          ></div>
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-[#001F3F]">Password Reset Request Details</h4>
                <p className="text-xs text-slate-500 mt-1">Request ID: {viewTarget.requestId}</p>
              </div>
              <button
                onClick={() => setViewTarget(null)}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Employee</p>
                <p className="font-semibold text-[#001F3F]">{viewTarget.userName || "-"}</p>
                <p className="text-slate-500">{viewTarget.userEmail}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Role / Branch</p>
                <p className="font-semibold text-[#001F3F]">{viewTarget.requestedRoleName || "-"}</p>
                <p className="text-slate-500">{viewTarget.branch || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Submitted Name</p>
                <p className="font-semibold text-[#001F3F]">
                  {`${viewTarget.requestedByFirstName || ""} ${viewTarget.requestedByLastName || ""}`.trim() || "-"}
                </p>
                <p className="text-slate-500">{viewTarget.requestedByEmail || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Submitted Address</p>
                <p className="font-semibold text-[#001F3F]">{viewTarget.requestedByAddress || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Requested At</p>
                <p className="font-semibold text-[#001F3F]">{formatDateTime(viewTarget.requestedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Reviewed At</p>
                <p className="font-semibold text-[#001F3F]">{formatDateTime(viewTarget.reviewedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    statusClassMap[viewTarget.status] ?? "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {viewTarget.status}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Reviewed By</p>
                <p className="font-semibold text-[#001F3F]">{viewTarget.reviewedByUserName || "-"}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              {viewTarget.status === "PendingApproval" ? (
                <>
                  <button
                    onClick={() =>
                      rejectMutation.mutate(viewTarget.requestId, {
                        onSuccess: () => setViewTarget(null),
                      })
                    }
                    disabled={confirmMutation.isPending || rejectMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200 disabled:opacity-60"
                  >
                    {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                  </button>
                  <button
                    onClick={() =>
                      confirmMutation.mutate(viewTarget.requestId, {
                        onSuccess: () => setViewTarget(null),
                      })
                    }
                    disabled={confirmMutation.isPending || rejectMutation.isPending}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-60"
                  >
                    {confirmMutation.isPending ? "Confirming..." : "Confirm"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setViewTarget(null)}
                  className="px-4 py-2 rounded-lg bg-[#001F3F] text-white text-xs font-bold"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
