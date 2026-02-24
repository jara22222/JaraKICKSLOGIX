import apiClient from "@/services/apiClient";
//added new client
export interface User {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface PostmanagerResponse {
  token: string;
  user: User;
}

export interface ManagerCredentials {
  firstName: string;
  middleName: string | null;
  lastName: string;
  address: string;
  branch: string;
  email: string;
}

export const createManagerAccount = async (
  credentials: ManagerCredentials,
): Promise<PostmanagerResponse> => {
  // Pass the LoginResponse type to axios.post so 'data' is typed correctly
  const { data } = await apiClient.post<PostmanagerResponse>(
    "/api/ManagerAccount/register-manager",
    credentials,
  );
  return data;
};
