import apiClient from "@/services/apiClient";
import type { IncomingShipment } from "@/modules/inbound/services/inboundData";

type ApiMessage = { message: string };

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export const getPendingSupplierShipmentsForApproval = async (): Promise<IncomingShipment[]> => {
  const { data } = await apiClient.get<IncomingShipment[]>(
    "/api/BranchManagerInboundApproval/pending-supplier-shipments",
  );

  return data.map((item) => ({
    ...item,
    dateSent: formatDate(item.dateSent),
    eta: formatDate(item.eta),
  }));
};

export const approveSupplierShipment = async (productId: string): Promise<ApiMessage> => {
  const { data } = await apiClient.put<ApiMessage>(
    `/api/BranchManagerInboundApproval/approve-supplier-shipment/${productId}`,
  );
  return data;
};
