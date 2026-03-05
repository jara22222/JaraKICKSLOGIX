import apiClient from "@/services/apiClient";

export interface BranchManagerOrder {
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

export interface BranchOutboundLog {
  pickId: string;
  orderRef: string;
  product: string;
  sku: string;
  qtyPicked: number;
  pickedByName: string;
  pickedByTime: string;
  binLocation: string;
  status: string;
}

type ApiMessage = { message: string };

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const getPendingBranchOrders = async (): Promise<BranchManagerOrder[]> => {
  const { data } = await apiClient.get<BranchManagerOrder[]>(
    "/api/BranchManagerOrder/pending-orders",
  );
  return data;
};

export const approveBranchOrder = async (orderId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/BranchManagerOrder/approve/${orderId}`,
  );
  return data;
};

export const cancelBranchOrder = async (orderId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/BranchManagerOrder/cancel/${orderId}`,
  );
  return data;
};

export const getBranchOutboundLogs = async (): Promise<BranchOutboundLog[]> => {
  const { data } = await apiClient.get<BranchOutboundLog[]>(
    "/api/BranchManagerOrder/outbound-logs",
  );

  return data.map((item) => ({
    ...item,
    pickedByTime: formatTime(item.pickedByTime),
  }));
};
