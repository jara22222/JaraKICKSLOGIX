import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getResetPasswordAccounts,
  resetPassword,
  resolveResetPasswordAccount,
  type ResetPasswordAccountOption,
} from "@/modules/auth/services/auth";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const directUserId = searchParams.get("uid") ?? "";
  const directToken = searchParams.get("token") ?? "";
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const [selectedAccount, setSelectedAccount] = useState<ResetPasswordAccountOption | null>(null);
  const [resolvedToken, setResolvedToken] = useState("");
  const [resolvedUserId, setResolvedUserId] = useState("");

  // Prefer email-based account selection whenever email is present in the link.
  const usingDirectLink = useMemo(
    () => !email && Boolean(directUserId && directToken),
    [directToken, directUserId, email],
  );
  const effectiveUserId = usingDirectLink ? directUserId : resolvedUserId;
  const effectiveToken = usingDirectLink ? directToken : resolvedToken;
  const isValidLink = useMemo(
    () => Boolean(effectiveUserId && effectiveToken),
    [effectiveToken, effectiveUserId],
  );
  const showInvalidLinkBanner = useMemo(() => {
    if (!email && !usingDirectLink) return true;
    if (usingDirectLink) return !isValidLink;
    return false;
  }, [email, isValidLink, usingDirectLink]);

  const {
    data: resetAccounts = [],
    isLoading: loadingAccounts,
    isError: accountFetchError,
  } = useQuery({
    queryKey: ["reset-password-accounts", email],
    queryFn: () => getResetPasswordAccounts(email),
    enabled: !usingDirectLink && Boolean(email),
    retry: false,
  });

  const resolveAccountMutation = useMutation({
    mutationFn: (payload: { email: string; userId: string }) => resolveResetPasswordAccount(payload),
    onSuccess: (data, variables) => {
      const account = resetAccounts.find((item) => item.userId === variables.userId) ?? null;
      setSelectedAccount(account);
      setResolvedUserId(data.userId);
      setResolvedToken(data.token);
      showSuccessToast("Account selected. You can now set a new password.");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Unable to prepare reset for selected account.";
      showErrorToast(message);
    },
  });

  const resetMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to reset password.";
      showErrorToast(message);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidLink) {
      showErrorToast("Invalid reset link.");
      return;
    }
    if (newPassword.length < 12) {
      showErrorToast("Password must be at least 12 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match.");
      return;
    }
    resetMutation.mutate({
      userId: effectiveUserId,
      token: effectiveToken,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020B1F] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#071733] shadow-2xl p-6">
        <h1 className="text-xl font-bold text-[#001F3F] dark:text-white">Reset Password</h1>
        <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
          Create a new password for your account.
        </p>

        {!usingDirectLink && email && (
          <div className="mt-4 space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-300">
              Select which account to reset for <span className="font-bold">{email}</span>.
            </p>
            {loadingAccounts && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-[#0A1F45] px-3 py-2 text-sm text-slate-600 dark:text-slate-200">
                Loading eligible accounts...
              </div>
            )}
            {!loadingAccounts && accountFetchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Failed to load eligible accounts.
              </div>
            )}
            {!loadingAccounts && !accountFetchError && resetAccounts.length === 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                No approved reset requests found for this email yet.
              </div>
            )}
            {!loadingAccounts && !accountFetchError && resetAccounts.length > 0 && (
              <div className="space-y-2">
                {resetAccounts.map((account) => (
                  <button
                    key={account.userId}
                    type="button"
                    onClick={() => resolveAccountMutation.mutate({ email, userId: account.userId })}
                    disabled={resolveAccountMutation.isPending}
                    className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                      selectedAccount?.userId === account.userId
                        ? "border-[#001F3F] bg-blue-50 dark:bg-blue-500/10"
                        : "border-slate-200 dark:border-slate-600 bg-white dark:bg-[#0A1F45] hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#001F3F] dark:text-white">
                      {account.userName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-300">
                      {`${account.firstName} ${account.lastName}`.trim()} • {account.roleName} •{" "}
                      {account.branch || "N/A"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {showInvalidLinkBanner ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid or incomplete reset link.
          </div>
        ) : isValidLink ? (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-[#0A1F45] text-slate-700 dark:text-slate-100"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-[#0A1F45] text-slate-700 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full rounded-lg bg-[#001F3F] text-white text-sm font-bold py-2.5 hover:bg-[#00162e] disabled:opacity-60"
            >
              {resetMutation.isPending ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : null}

        <div className="mt-5 text-center">
          <Link to="/login" className="text-xs font-semibold text-[#001F3F] dark:text-[#FFD700] hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
