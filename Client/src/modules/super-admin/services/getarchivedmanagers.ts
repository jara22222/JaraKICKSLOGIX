import apiClient from "@/services/apiClient";

export interface ArchivedManagerResponse {
  id: string;
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  address: string;
  branch: string;
  isActive: string;
  createdAt: string;
}

export const getArchivedManagers = async (): Promise<ArchivedManagerResponse[]> => {
  const { data } = await apiClient.get<ArchivedManagerResponse[]>(
    "/api/ArchiveUser/archived-managers",
  );
  return data;
};
