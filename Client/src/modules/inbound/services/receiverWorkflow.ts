import apiClient from "@/services/apiClient";

export interface RegisterReceivedProductPayload {
  supplier: string;
  productName: string;
  sku: string;
  size: "S" | "M" | "L" | "XL" | "XXL";
  quantity: number;
}

export interface RegisterReceivedProductResponse {
  productId: string;
  productName: string;
  supplier: string;
  sku: string;
  size: string;
  quantity: number;
  workflowStatus: string;
  binId: string;
  binLocation: string;
  receivedAt: string;
}

export const registerReceivedProduct = async (
  payload: RegisterReceivedProductPayload,
): Promise<RegisterReceivedProductResponse> => {
  const { data } = await apiClient.post<RegisterReceivedProductResponse>(
    "/api/ReceiverWorkflow/register-received-product",
    payload,
  );
  return data;
};
