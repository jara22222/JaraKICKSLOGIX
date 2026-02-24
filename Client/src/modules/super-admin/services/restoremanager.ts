import apiClient from "@/services/apiClient";

export interface RestoreManagerResponse {
  message: string;
}

export const restoreManagerAccount = async (
  managerId: string,
): Promise<RestoreManagerResponse> => {
  const { data } = await apiClient.put<RestoreManagerResponse>(
    `/api/ArchiveUser/restore-manager/${managerId}`,
  );
  return data;
};
