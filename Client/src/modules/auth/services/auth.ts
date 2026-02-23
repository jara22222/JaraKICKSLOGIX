import apiClient from "@/api/apiClient";
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
  // Pass the LoginResponse type to axios.post so 'data' is typed correctly
  const { data } = await apiClient.post<LoginResponse>(
    "/Auth/login",
    credentials,
  );
  return data;
};
