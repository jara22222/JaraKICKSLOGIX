import apiClient from "@/services/apiClient";

export interface SuperAdminPasswordResetRequest {
  requestId: string;
  userId: string;
  branch: string;
  userEmail: string;
  userName: string;
  requestedByFirstName: string;
  requestedByLastName: string;
  requestedByEmail: string;
  requestedByAddress: string;
  requestedRoleName: string;
  status: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedByUserName?: string;
  reviewRemarks?: string;
}

export interface ApiMessageResponse {
  message: string;
}

export const getSuperAdminPasswordResetRequests = async (): Promise<SuperAdminPasswordResetRequest[]> => {
  const { data } = await apiClient.get<SuperAdminPasswordResetRequest[]>(
    "/api/BranchAccount/super-admin/password-reset-requests",
  );
  return data;
};

export const confirmSuperAdminPasswordResetRequest = async (
  requestId: string,
  remarks?: string,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.put<ApiMessageResponse>(
    `/api/BranchAccount/super-admin/password-reset-requests/${requestId}/confirm`,
    { remarks },
  );
  return data;
};

export const rejectSuperAdminPasswordResetRequest = async (
  requestId: string,
  remarks?: string,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.put<ApiMessageResponse>(
    `/api/BranchAccount/super-admin/password-reset-requests/${requestId}/reject`,
    { remarks },
  );
  return data;
};
