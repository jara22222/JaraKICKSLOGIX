import apiClient from "@/services/apiClient";
import type { AxiosRequestConfig } from "axios";
//added new client
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  branch?: string;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  userName: string;
  password: string;
}

export interface BranchForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  userId: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordAccountOption {
  userId: string;
  userName: string;
  firstName: string;
  lastName: string;
  roleName: string;
  branch: string;
}

export interface ResolveResetAccountPayload {
  email: string;
  userId: string;
}

export interface ResolveResetAccountResponse {
  userId: string;
  token: string;
}

export const loginUser = async (
  credentials: LoginCredentials,
): Promise<LoginResponse> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };

  // Pass the LoginResponse type to axios.post so 'data' is typed correctly
  const { data } = await apiClient.post<LoginResponse>(
    "api/Auth/login",
    credentials,
    requestConfig,
  );
  return data;
};

export const requestBranchPasswordReset = async (
  payload: BranchForgotPasswordPayload,
): Promise<ApiMessageResponse> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.post<ApiMessageResponse>(
    "api/Auth/forgot-password/branch-request",
    payload,
    requestConfig,
  );
  return data;
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<ApiMessageResponse> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.post<ApiMessageResponse>(
    "api/Auth/reset-password",
    payload,
    requestConfig,
  );
  return data;
};

export const getResetPasswordAccounts = async (
  email: string,
): Promise<ResetPasswordAccountOption[]> => {
  const { data } = await apiClient.get<{ accounts: ResetPasswordAccountOption[] }>(
    "api/Auth/reset-password/options",
    { params: { email } },
  );
  return data.accounts ?? [];
};

export const resolveResetPasswordAccount = async (
  payload: ResolveResetAccountPayload,
): Promise<ResolveResetAccountResponse> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.post<ResolveResetAccountResponse>(
    "api/Auth/reset-password/resolve-account",
    payload,
    requestConfig,
  );
  return data;
};

export interface ApiMessageResponse {
  message: string;
}
