import apiClient from "@/services/apiClient";
import type { AxiosRequestConfig } from "axios";

export interface CreateBranchEmployeePayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  roleName: "Receiver" | "PutAway" | "VASPersonnel" | "DispatchClerk";
  email: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface BranchEmployee {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  roleName: "Receiver" | "PutAway" | "VASPersonnel" | "DispatchClerk" | string;
  branch: string;
  status: string;
  lastActiveAt: string;
}

export interface BranchPasswordResetRequest {
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
  status: "PendingApproval" | "Approved" | "Rejected" | "Completed" | string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedByUserName?: string;
  reviewRemarks?: string;
}

export const createBranchEmployee = async (
  payload: CreateBranchEmployeePayload,
): Promise<ApiMessageResponse> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.post<ApiMessageResponse>(
    "/api/BranchAccount/create-employee",
    payload,
    requestConfig,
  );

  return data;
};

export const getBranchEmployees = async (): Promise<BranchEmployee[]> => {
  const { data } = await apiClient.get<BranchEmployee[]>(
    "/api/BranchAccount/branch-employees",
  );
  return data;
};

export const getArchivedBranchEmployees = async (): Promise<BranchEmployee[]> => {
  const { data } = await apiClient.get<BranchEmployee[]>(
    "/api/BranchAccount/archived-employees",
  );
  return data;
};

export const archiveBranchEmployee = async (
  employeeId: string,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.put<ApiMessageResponse>(
    `/api/BranchAccount/archive-employee/${employeeId}`,
  );
  return data;
};

export const restoreBranchEmployee = async (
  employeeId: string,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.put<ApiMessageResponse>(
    `/api/BranchAccount/restore-employee/${employeeId}`,
  );
  return data;
};

export const getBranchPasswordResetRequests = async (): Promise<BranchPasswordResetRequest[]> => {
  const { data } = await apiClient.get<BranchPasswordResetRequest[]>(
    "/api/BranchAccount/password-reset-requests",
  );
  return data;
};

export const confirmBranchPasswordResetRequest = async (
  requestId: string,
  remarks?: string,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.put<ApiMessageResponse>(
    `/api/BranchAccount/password-reset-requests/${requestId}/confirm`,
    { remarks },
  );
  return data;
};

export const rejectBranchPasswordResetRequest = async (
  requestId: string,
  remarks?: string,
): Promise<ApiMessageResponse> => {
  const { data } = await apiClient.put<ApiMessageResponse>(
    `/api/BranchAccount/password-reset-requests/${requestId}/reject`,
    { remarks },
  );
  return data;
};
