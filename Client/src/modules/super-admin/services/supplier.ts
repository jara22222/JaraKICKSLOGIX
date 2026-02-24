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

export const getSuppliers = async (): Promise<SupplierListItemResponse[]> => {
  const { data } = await apiClient.get<SupplierListItemResponse[]>(
    "/api/Supplier/get-suppliers",
  );
  return data;
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
