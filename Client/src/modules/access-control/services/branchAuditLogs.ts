import apiClient from "@/services/apiClient";

export interface BranchAuditLogResponse {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  branch: string;
  datePerformed: string;
}

export const getBranchAuditLogs = async (): Promise<BranchAuditLogResponse[]> => {
  const { data } = await apiClient.get<BranchAuditLogResponse[]>(
    "/api/BranchManagerAuditLogs/my-branch-logs",
  );
  return data;
};
