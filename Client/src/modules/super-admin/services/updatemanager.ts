import apiClient from "@/services/apiClient";

export interface UpdateManagerPayload {
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  address: string;
  branch: string;
  isActive: string;
}

export interface UpdateManagerResponse {
  message: string;
}

export const updateManagerAccount = async (
  managerId: string,
  payload: UpdateManagerPayload,
): Promise<UpdateManagerResponse> => {
  const { data } = await apiClient.put<UpdateManagerResponse>(
    `/api/ManagerUpdateContoller/update-manager/${managerId}`,
    payload,
  );
  return data;
};
