import apiClient from "@/services/apiClient";

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

type ApiMessage = { message: string };

export const getVASPendingItems = async (): Promise<VASPendingItem[]> => {
  const { data } = await apiClient.get<VASPendingItem[]>(
    "/api/VASWorkflow/pending-items",
  );
  return data;
};

export const scanVASPacking = async (
  orderId: string,
  qrValue: string,
): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/VASWorkflow/scan-packing/${orderId}`,
    { qrValue },
  );
  return data;
};

export const markVASDone = async (orderId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/VASWorkflow/mark-done/${orderId}`,
  );
  return data;
};
