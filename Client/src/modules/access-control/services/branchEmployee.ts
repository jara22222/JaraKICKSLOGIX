import apiClient from "@/services/apiClient";

export interface CreateBranchEmployeePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  roleName: "Receiver" | "PutAway" | "VASPersonnel";
  email: string;
}

export interface ApiMessageResponse {
  message: string;
}

export const createBranchEmployee = async (
  payload: CreateBranchEmployeePayload,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.post<ApiMessageResponse>(
    "/api/BranchAccount/create-employee",
    payload,
  );

  return data;
};
