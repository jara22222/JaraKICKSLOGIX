import apiClient from "@/services/apiClient";
import type { AxiosRequestConfig } from "axios";
//added new client
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
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
