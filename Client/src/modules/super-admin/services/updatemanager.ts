import apiClient from "@/services/apiClient";
import type { AxiosRequestConfig } from "axios";

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
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.put<UpdateManagerResponse>(
    `/api/ManagerUpdateContoller/update-manager/${managerId}`,
    payload,
    requestConfig,
  );
  return data;
};
