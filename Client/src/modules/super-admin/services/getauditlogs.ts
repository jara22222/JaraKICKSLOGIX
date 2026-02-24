import apiClient from "@/services/apiClient";

export interface AuditLogResponse {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  branch: string;
  datePerformed: string;
}

export const getAuditLogs = async (): Promise<AuditLogResponse[]> => {
  const { data } = await apiClient.get<AuditLogResponse[]>(
    "/api/AuditLogs/get-audit-logs",
  );
  return data;
};
