import { Button } from "@/shared/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/shared/components/ui/input-group";
import { AlertCircle, LockIcon, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  requestBranchPasswordReset,
  type BranchForgotPasswordPayload,
  type LoginCredentials,
} from "../services/auth";
import { useMutation } from "@tanstack/react-query";
import { showErrorToast, showSuccessToast } from "@/shared/lib/toast";

const getRedirectPathByRoles = (roles?: string[]) => {
  if (roles?.includes("SuperAdmin")) return "/superadmin";
  if (roles?.includes("BranchManager")) return "/accesscontroll";
  if (roles?.includes("PutAway")) return "/inbound/putaway";
  if (roles?.includes("Receiver")) return "/inbound";
  if (roles?.includes("DispatchClerk")) return "/outbound";
  if (roles?.includes("VASPersonnel")) return "/vas";
  return "/login";
};

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginCredentials>({
    userName: "",
    password: "",
  });
  const [clientErrors, setClientErrors] = useState<{
    userName?: string;
    password?: string;
  }>({});
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState<BranchForgotPasswordPayload>({
    email: "",
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // 1. Store token
      localStorage.setItem("token", data.token);
      // 2. Store user info (optional, or use a state manager)
      localStorage.setItem("user", JSON.stringify(data.user));

      showSuccessToast(`Welcome back, ${data.user.firstName}!`);
      navigate(getRedirectPathByRoles(data.user?.roles), { replace: true });
    },
  });
  const forgotMutation = useMutation({
    mutationFn: requestBranchPasswordReset,
    onSuccess: (data) => {
      showSuccessToast(data.message || "Password reset request submitted for admin review.");
      setIsForgotOpen(false);
      setForgotForm({
        email: "",
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Unable to submit request right now.";
      showErrorToast(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { userName?: string; password?: string } = {};
    const normalizedUserName = form.userName.trim();
    const normalizedPassword = form.password.trim();

    if (!normalizedUserName) {
      nextErrors.userName = "Username is required.";
    }
    if (!normalizedPassword) {
      nextErrors.password = "Password is required.";
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutation.mutate({
      userName: normalizedUserName,
      password: normalizedPassword,
    });
  };
  const handleForgotSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!forgotForm.email.trim()) {
      showErrorToast("Email is required.");
      return;
    }

    forgotMutation.mutate({
      email: forgotForm.email.trim(),
    });
  };
  const getFieldError = (fieldName: "UserName" | "Password") => {
    if (fieldName === "UserName" && clientErrors.userName) {
      return clientErrors.userName;
    }
    if (fieldName === "Password" && clientErrors.password) {
      return clientErrors.password;
    }

    return (mutation.error as any)?.response?.data?.errors?.[fieldName]?.[0];
  };
  const getNonFieldError = () => {
    const error = mutation.error as any;
    const errorResponse = error?.response;
    const responseData = errorResponse?.data;
    const rawMessage = String(responseData?.message || error?.message || "");

    if (errorResponse?.status === 401) {
      return "Username and password do not exist.";
    }

    if (!errorResponse) {
      return "Cannot connect to server. On mobile, use HTTPS app URL and make sure both frontend and backend are running on the same Wi-Fi.";
    }

    if (
      /network error|failed to fetch|certificate|ssl|self signed|mixed content/i.test(
        rawMessage,
      )
    ) {
      return "Connection blocked by network/security settings. Please use HTTPS URL, accept local certificate warning, then try again.";
    }

    if (!responseData?.errors && responseData?.title) {
      return String(responseData.title);
    }
    if (responseData?.message) {
      return String(responseData.message);
    }
    return null;
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="w-full text-[#001F3F] dark:text-slate-100 flex flex-col gap-5 max-w-md mx-auto">
          {/* input header */}
          <div className="flex flex-col justify-center gap-2 items-center">
            <h3 className="text-4xl font-extrabold text-[#001F3F] dark:text-white tracking-tight mb-2">
              Welcome Back
            </h3>
            <p className="text-slate-500 dark:text-slate-300 font-medium text-center">
              Please enter your username and password to access your station.
            </p>
          </div>
          {/* User input */}
          <div className="employee flex flex-col gap-2 h-full">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
              Username
            </span>
            <InputGroup className="h-12 w-full flex items-center border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden bg-white dark:bg-[#0A1F45] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:invalid]:border-red-500 has-[:invalid]:ring-red-500">
              <InputGroupInput
                className="w-full h-full px-3 outline-none bg-transparent text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 invalid:text-red-600"
                placeholder="e.g. DelaCruzKicksLogix"
                value={form.userName}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => {
                  setForm({ ...form, userName: e.target.value });
                  if (clientErrors.userName) {
                    setClientErrors((prev) => ({
                      ...prev,
                      userName: undefined,
                    }));
                  }
                }}
              />
              <InputGroupAddon className="px-3 text-gray-500 dark:text-slate-400 group-has-[:invalid]:text-red-500">
                <User />
              </InputGroupAddon>
            </InputGroup>
            {getFieldError("UserName") && (
              <span className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {getFieldError("UserName")}
              </span>
            )}
          </div>
          {/* Password input */}
          <div className="employee flex flex-col gap-2 h-full">
            <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
              Password
            </span>
            <InputGroup className="h-12 w-full flex items-center border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden bg-white dark:bg-[#0A1F45] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:invalid]:border-red-500 has-[:invalid]:ring-red-500">
              <InputGroupInput
                className="w-full h-full px-3 outline-none bg-transparent text-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400 invalid:text-red-600"
                placeholder="********"
                type="password"
                value={form.password}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (clientErrors.password) {
                    setClientErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }
                }}
              />
              <InputGroupAddon className="px-3 text-gray-500 dark:text-slate-400 group-has-[:invalid]:text-red-500">
                <LockIcon />
              </InputGroupAddon>
            </InputGroup>
            {getFieldError("Password") && (
              <span className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {getFieldError("Password")}
              </span>
            )}
            {mutation.isError && getNonFieldError() && (
              <span className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> {getNonFieldError()}
              </span>
            )}
          </div>
          {/* Log in button */}
          <div className="w-full flex flex-col gap-3">
            <Button
              className="h-12 w-full bg-[#FFD700] border border-[#FFD700] font-bold text-slate-800 hover:text-white hover:bg-[#e6c200]"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign In to Portal"}
            </Button>
            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-xs font-semibold text-[#001F3F] dark:text-[#FFD700] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          {/* Help Footer */}
          <div className="mt-6 text-center border-t border-slate-200 dark:border-white/10 pt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Restricted Area. Unauthorized access is monitored.
              <br />
              <button className="font-semibold text-[#001F3F] dark:text-[#FFD700] hover:underline mt-1">
                Contact System Admin for Access
              </button>
            </p>
          </div>
        </div>
      </form>
      {isForgotOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#001F3F]/75 backdrop-blur-sm"
            onClick={() => !forgotMutation.isPending && setIsForgotOpen(false)}
          ></div>
          <form
            onSubmit={handleForgotSubmit}
            className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#071733] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 dark:border-white/10">
              <h3 className="text-lg font-bold text-[#001F3F] dark:text-white">
                Branch Password Recovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1">
                Submit your email. Branch Manager or Super Admin must verify before reset email is sent.
              </p>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                required
                placeholder="Registered Email"
                value={forgotForm.email}
                onChange={(event) =>
                  setForgotForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="sm:col-span-2 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-sm bg-white dark:bg-[#0A1F45] text-slate-700 dark:text-slate-100"
              />
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-[#06122A] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsForgotOpen(false)}
                disabled={forgotMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-300"
              >
                Cancel
              </button>
              <Button type="submit" disabled={forgotMutation.isPending}>
                {forgotMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
