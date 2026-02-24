import apiClient from "@/services/apiClient";

export interface PostmanagerResponse {
  message: string;
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
  // API returns a success message for manager creation
  const { data } = await apiClient.post<PostmanagerResponse>(
    "/api/ManagerAccount/register-manager",
    credentials,
  );
  return data;
};
