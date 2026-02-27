import apiClient from "@/services/apiClient";

export interface PutAwayTask {
  productId: string;
  sku: string;
  size: string;
  quantity: number;
  workflowStatus: string;
  binId: string;
  binLocation: string;
  itemQrString: string;
  dateReceived: string;
}

type ApiMessage = { message: string };

export const getPendingPutAwayProducts = async (): Promise<PutAwayTask[]> => {
  const { data } = await apiClient.get<PutAwayTask[]>(
    "/api/PutAwayWorkflow/pending-products",
  );
  return data;
};

export const claimPutAwayTask = async (productId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/PutAwayWorkflow/claim/${productId}`,
  );
  return data;
};

export const scanPutAwayItem = async (
  productId: string,
  qrValue: string,
): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/PutAwayWorkflow/scan-item/${productId}`,
    { qrValue },
  );
  return data;
};

export const scanPutAwayBin = async (
  productId: string,
  qrValue: string,
): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/PutAwayWorkflow/scan-bin/${productId}`,
    { qrValue },
  );
  return data;
};
