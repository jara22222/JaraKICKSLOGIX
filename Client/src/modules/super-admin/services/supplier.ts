import apiClient from "@/services/apiClient";

export interface SupplierPayload {
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string;
  agreement: boolean;
}

export interface SupplierResponse {
  message: string;
}

export interface SupplierListItemResponse {
  id: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  email: string;
  status: string;
  agreement: boolean;
  createdAt: string;
}

const STATIC_SUPPLIERS: SupplierListItemResponse[] = [
  {
    id: "seed-s1",
    companyName: "Nike Global",
    companyAddress: "Nike HQ, Beaverton, Oregon",
    contactPerson: "Sarah Connors",
    email: "supply@nike.com",
    status: "Active",
    agreement: true,
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "seed-s2",
    companyName: "Adidas Originals",
    companyAddress: "Herzogenaurach, Germany",
    contactPerson: "Gary Vee",
    email: "b2b@adidas.com",
    status: "Active",
    agreement: true,
    createdAt: "2026-01-12T00:00:00.000Z",
  },
  {
    id: "seed-s3",
    companyName: "Puma Logistics",
    companyAddress: "Puma Way, Somerville, MA",
    contactPerson: "Usain Bolt",
    email: "orders@puma.com",
    status: "Pending",
    agreement: false,
    createdAt: "2026-02-05T00:00:00.000Z",
  },
  {
    id: "seed-s4",
    companyName: "New Balance Inc.",
    companyAddress: "Boston, Massachusetts",
    contactPerson: "Kawhi Leonard",
    email: "partners@nb.com",
    status: "Active",
    agreement: true,
    createdAt: "2026-02-08T00:00:00.000Z",
  },
];

export const getSuppliers = async (): Promise<SupplierListItemResponse[]> => {
  return Promise.resolve(STATIC_SUPPLIERS);
};

export const createSupplier = async (
  payload: SupplierPayload,
): Promise<SupplierResponse> => {
  const { data } = await apiClient.post<SupplierResponse>(
    "/api/Supplier/register-supplier",
    payload,
  );
  return data;
};

export const updateSupplierAccount = async (
  supplierId: string,
  payload: SupplierPayload,
): Promise<SupplierResponse> => {
  const { data } = await apiClient.put<SupplierResponse>(
    `/api/Supplier/update-supplier/${supplierId}`,
    payload,
  );
  return data;
};

export const archiveSupplierAccount = async (
  supplierId: string,
): Promise<SupplierResponse> => {
  const { data } = await apiClient.put<SupplierResponse>(
    `/api/Supplier/archive-supplier/${supplierId}`,
  );
  return data;
};
