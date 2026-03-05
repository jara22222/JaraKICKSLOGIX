import apiClient from "@/services/apiClient";
import type { AxiosRequestConfig } from "axios";

export interface DispatchOrder {
  orderId: string;
  sku: string;
  size: string;
  binLocation: string;
  quantity: number;
  status: string;
  customerName: string;
  customerAddress: string;
  courierId: string;
  createdAt: string;
}

export interface DispatchActivity {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
}

type ApiMessage = { message: string };

export const getApprovedDispatchOrders = async (): Promise<DispatchOrder[]> => {
  const { data } = await apiClient.get<DispatchOrder[]>(
    "/api/DispatchWorkflow/approved-orders",
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

export const getDispatchActivityLog = async (): Promise<DispatchActivity[]> => {
  const { data } = await apiClient.get<DispatchActivity[]>("/api/DispatchWorkflow/activity-log");
  return data.map((entry) => ({
    ...entry,
    timestamp: formatDateTime(entry.timestamp),
  }));
};

export const claimDispatchOrder = async (orderId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/DispatchWorkflow/claim/${orderId}`,
  );
  return data;
};

export const scanDispatchItem = async (
  orderId: string,
  qrValue: string,
): Promise<ApiMessage> => {
  const requestConfig: AxiosRequestConfig & { suppressErrorToast?: boolean } = {
    suppressErrorToast: true,
  };
  const { data } = await apiClient.put<ApiMessage>(
    `/api/DispatchWorkflow/scan-item/${orderId}`,
    { qrValue },
    requestConfig,
  );
  return data;
};

export const confirmDispatchQuantity = async (
  orderId: string,
  quantity: number,
): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/DispatchWorkflow/confirm-quantity/${orderId}`,
    { quantity },
  );
  return data;
};
