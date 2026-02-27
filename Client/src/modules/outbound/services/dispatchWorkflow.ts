import apiClient from "@/services/apiClient";

export interface DispatchOrder {
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

type ApiMessage = { message: string };

export const getApprovedDispatchOrders = async (): Promise<DispatchOrder[]> => {
  const { data } = await apiClient.get<DispatchOrder[]>(
    "/api/DispatchWorkflow/approved-orders",
  );
  return data;
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
  const { data } = await apiClient.put<ApiMessage>(
    `/api/DispatchWorkflow/scan-item/${orderId}`,
    { qrValue },
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
