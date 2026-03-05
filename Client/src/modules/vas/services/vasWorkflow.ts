import apiClient from "@/services/apiClient";
import type { AxiosRequestConfig } from "axios";

export interface VASPendingItem {
  orderId: string;
  sku: string;
  size: string;
  quantity: number;
  status: string;
  customerName: string;
  customerAddress: string;
  courierId: string;
  createdAt: string;
}

export interface VASActivity {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
}

type ApiMessage = { message: string };

export const getVASPendingItems = async (): Promise<VASPendingItem[]> => {
  const { data } = await apiClient.get<VASPendingItem[]>(
    "/api/VASWorkflow/pending-items",
  );
  return data;
};

export const getVASOutboundReadyItems = async (): Promise<VASPendingItem[]> => {
  const { data } = await apiClient.get<VASPendingItem[]>(
    "/api/VASWorkflow/outbound-ready-items",
  );
  return data;
};

export const getPublicVASOutboundReadyItems = async (): Promise<VASPendingItem[]> => {
  const { data } = await apiClient.get<VASPendingItem[]>(
    "/api/VASWorkflow/public-outbound-ready-items",
  );
  return data;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getVASActivityLog = async (): Promise<VASActivity[]> => {
  const { data } = await apiClient.get<VASActivity[]>("/api/VASWorkflow/activity-log");
  return data.map((entry) => ({
    ...entry,
    timestamp: formatDateTime(entry.timestamp),
  }));
};

export const scanVASPacking = async (
  orderId: string,
  qrValue: string,
): Promise<ApiMessage> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.put<ApiMessage>(
    `/api/VASWorkflow/scan-packing/${orderId}`,
    { qrValue },
    requestConfig,
  );
  return data;
};

export const markVASDone = async (orderId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/VASWorkflow/mark-done/${orderId}`,
  );
  return data;
};
