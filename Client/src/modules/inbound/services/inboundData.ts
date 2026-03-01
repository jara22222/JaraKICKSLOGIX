import apiClient from "@/services/apiClient";

export type IncomingShipment = {
  id: string;
  poRef: string;
  supplier: string;
  product: string;
  sku: string;
  size: "S" | "M" | "L" | "XL" | "XXL";
  qty: number;
  dateSent: string;
  eta: string;
  status:
    | "In Transit"
    | "Arrived"
    | "Accepted"
    | "Stored"
    | "PendingAdminApproval"
    | "PendingReceive";
};

export type InboundReceipt = {
  id: string;
  poRef: string;
  product: string;
  sku: string;
  qty: number;
  receivedBy: { name: string; role: string; time: string };
  putawayBy: { name: string; role: string; time: string };
  location: { type: string; id: string };
  status: string;
};

export type InboundActivity = {
  id: string;
  user: string;
  action: string;
  description: string;
  timestamp: string;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const getInboundIncomingShipments = async (): Promise<IncomingShipment[]> => {
  const { data } = await apiClient.get<IncomingShipment[]>(
    "/api/ReceiverWorkflow/incoming-shipments",
  );

  return data.map((item) => ({
    ...item,
    dateSent: formatDate(item.dateSent),
    eta: formatDate(item.eta),
  }));
};

export const getInboundReceipts = async (): Promise<InboundReceipt[]> => {
  const { data } = await apiClient.get<InboundReceipt[]>("/api/ReceiverWorkflow/receipts");
  return data.map((receipt) => ({
    ...receipt,
    receivedBy: {
      ...receipt.receivedBy,
      time: receipt.receivedBy.time === "-" ? "-" : formatDateTime(receipt.receivedBy.time),
    },
    putawayBy: {
      ...receipt.putawayBy,
      time: receipt.putawayBy.time === "-" ? "-" : formatDateTime(receipt.putawayBy.time),
    },
  }));
};

export const getInboundActivityLog = async (): Promise<InboundActivity[]> => {
  const { data } = await apiClient.get<InboundActivity[]>("/api/ReceiverWorkflow/activity-log");
  return data.map((entry) => ({
    ...entry,
    timestamp: formatDateTime(entry.timestamp),
  }));
};
