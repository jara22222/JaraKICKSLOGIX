import { Button } from "@/shared/components/ui/button";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/shared/components/ui/input-group";
import { AlertCircle, LockIcon, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, type LoginCredentials } from "../services/auth";
import { useMutation } from "@tanstack/react-query";
import { showSuccessToast } from "@/shared/lib/toast";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { userName?: string; password?: string } = {};

    if (!form.userName.trim()) {
      nextErrors.userName = "Username is required.";
    }
    if (!form.password.trim()) {
      nextErrors.password = "Password is required.";
    }

    setClientErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    mutation.mutate(form);
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
    const errorResponse = (mutation.error as any)?.response;
    const responseData = errorResponse?.data;

    if (errorResponse?.status === 401) {
      return "Username and password do not exist.";
    }

    if (!responseData?.errors && responseData?.title) {
      return String(responseData.title);
    }
    return null;
  };
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="w-full text-[#001F3F] flex flex-col gap-5 max-w-md">
          {/* input header */}
          <div className="flex flex-col justify-center gap-2 items-center">
            <h3 className="text-4xl font-extrabold text-[#001F3F] tracking-tight mb-2">
              Welcome Back
            </h3>
            <p className="text-slate-400 font-medium">
              Please enter your credentials to access your station.
            </p>
          </div>
          {/* User input */}
          <div className="employee flex flex-col gap-2 h-full">
            <span className="font-bold text-sm">Employee ID or Username</span>
            <InputGroup className=" h-12 w-full flex items-center border border-gray-300 rounded-md overflow-hiddenfocus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:invalid]:border-red-500 has-[:invalid]:ring-red-500">
              <InputGroupInput
                className="w-full h-full px-3 outline-none bg-transparent placeholder-gray-400 invalid:text-red-600"
                placeholder="e.g. 547541 or John_Doe"
                value={form.userName}
                onChange={(e) => {
                  setForm({ ...form, userName: e.target.value });
                  if (clientErrors.userName) {
                    setClientErrors((prev) => ({ ...prev, userName: undefined }));
                  }
                }}
              />
              <InputGroupAddon className="px-3 text-gray-500 group-has-[:invalid]:text-red-500">
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
            <span className="font-bold text-sm">Password</span>
            <InputGroup className=" h-12 w-full flex items-center border border-gray-300 rounded-md overflow-hiddenfocus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 has-[:invalid]:border-red-500 has-[:invalid]:ring-red-500">
              <InputGroupInput
                className="w-full h-full px-3 outline-none bg-transparent placeholder-gray-400 invalid:text-red-600"
                placeholder="********"
                type="password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  if (clientErrors.password) {
                    setClientErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
              />
              <InputGroupAddon className="px-3 text-gray-500 group-has-[:invalid]:text-red-500">
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
              className="h-12 w-full bg-[#FFD700] border font-bold text-slate-800 hover:text-white"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Sign In to Portal"}
            </Button>
          </div>
          {/* Divider */}
          <div className="relative flex items-center justify-center my-4">
            <span className="absolute px-3 bg-white text-gray-500 text-xs">
              Or continue with
            </span>
            <div className="w-full border-t border-gray-200"></div>
          </div>
          {/* Google sign in */}
          <div>
            <Button className="w-full h-12 flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 shadow-sm transition-all duration-200 transform active:scale-95">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google Logo"
                className="h-5 w-5"
              />
              <span className="font-medium text-gray-700">
                Sign in with Google
              </span>
            </Button>
          </div>
          {/* Help Footer */}
          <div className="mt-6 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 leading-relaxed">
              Restricted Area. Unauthorized access is monitored.
              <br />
              <button className="font-semibold text-[#001F3F] hover:underline mt-1">
                Contact System Admin for Access
              </button>
            </p>
          </div>
        </div>
      </form>
    </>
  );
}
