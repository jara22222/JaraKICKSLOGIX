import apiClient from "@/services/apiClient";

export interface ArchiveManagerResponse {
  message: string;
}

export const archiveManagerAccount = async (
  managerId: string,
): Promise<ArchiveManagerResponse> => {
  const { data } = await apiClient.put<ArchiveManagerResponse>(
    `/api/ArchiveUser/archive-manager/${managerId}`,
  );
  return data;
};
