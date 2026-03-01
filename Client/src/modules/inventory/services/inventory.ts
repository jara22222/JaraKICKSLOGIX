import apiClient from "@/services/apiClient";

export type InventoryItem = {
  binLocation: string;
  productName: string;
  status: string;
  sku: string;
  size: string;
  quantity: number;
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data } = await apiClient.get<InventoryItem[]>("/api/BranchManagerInventory/items");
  return data;
};
