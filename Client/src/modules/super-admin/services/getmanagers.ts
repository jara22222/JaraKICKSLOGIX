import apiClient from "@/services/apiClient";

export interface GetManagerItemResponse {
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
  name: string;
}

export const getManagers = async (): Promise<GetManagerItemResponse[]> => {
  // Backend route currently expects a segment under /api/GetAllManager/{...}
  const { data } = await apiClient.get<GetManagerItemResponse[]>(
    "/api/GetAllManager/get-managers",
  );
  return data;
};
