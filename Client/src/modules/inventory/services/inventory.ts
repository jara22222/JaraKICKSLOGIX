import apiClient from "@/services/apiClient";

export type InventoryItem = {
  productId: string;
  binLocation: string;
  binStatus: string;
  sku: string;
  supplierName: string;
  productName: string;
  itemBatchName: string;
  batchQty: number;
  totalProductQty: number;
  size: string;
  datePuted: string;
  dateUpdated: string;
  lowStockStatus: string;
  lowStockApprovalStatus: string;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeDateTime = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) {
    return "-";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  return formatDateTime(value);
};

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const { data } = await apiClient.get<any[]>("/api/BranchManagerInventory/items");

  return data.map((item) => {
    const totalProductQty = safeNumber(item?.totalProductQty ?? item?.quantity, 0);
    const batchQty = safeNumber(item?.batchQty, Math.ceil(totalProductQty / 20));

    return {
      productId: item?.productId ?? "",
      binLocation: item?.binLocation ?? "Unassigned",
      binStatus: item?.binStatus ?? "Unknown",
      sku: item?.sku ?? "-",
      supplierName: item?.supplierName ?? "Unknown Supplier",
      productName: item?.productName ?? item?.itemBatchName ?? "Unknown Product",
      itemBatchName: item?.itemBatchName ?? item?.productName ?? "Unknown Batch",
      batchQty,
      totalProductQty,
      size: item?.size ?? "-",
      datePuted: safeDateTime(item?.datePuted),
      dateUpdated: safeDateTime(item?.dateUpdated),
      lowStockStatus: item?.lowStockStatus ?? item?.status ?? "Healthy",
      lowStockApprovalStatus: item?.lowStockApprovalStatus ?? "N/A",
    };
  });
};

type ApiMessage = { message: string };

export const approveLowStockItem = async (productId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/BranchManagerInventory/approve-low-stock/${productId}`,
  );
  return data;
};
