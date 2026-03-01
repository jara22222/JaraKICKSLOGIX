import apiClient from "@/services/apiClient";

export type SupplierPartner = {
  id: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string;
  status: string;
  agreement: boolean;
  createdAt: string;
};

export type SupplierReplenishmentOrder = {
  id: string;
  partner: string;
  items: number;
  created: string;
  eta: string;
  status: string;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

export const getSupplierPartners = async (): Promise<SupplierPartner[]> => {
  const { data } = await apiClient.get<SupplierPartner[]>(
    "/api/BranchManagerSupplier/partners",
  );
  return data;
};

export const getSupplierReplenishmentOrders = async (): Promise<
  SupplierReplenishmentOrder[]
> => {
  const { data } = await apiClient.get<SupplierReplenishmentOrder[]>(
    "/api/BranchManagerSupplier/replenishment-orders",
  );
  return data.map((item) => ({
    ...item,
    created: formatDate(item.created),
    eta: formatDate(item.eta),
  }));
};
