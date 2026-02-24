import apiClient from "@/services/apiClient";

export type BinStatus = "Available" | "Occupied";
export type BinSize = "S" | "M" | "L" | "XL" | "XXL";

export interface BinLocationItemResponse {
  binId: string;
  binLocation: string;
  binStatus: string;
  binSize: string;
  binCapacity: number;
  qrCodeString: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBinLocationPayload {
  binLocation: string;
  binSize: BinSize;
  binCapacity: number;
}

export interface UpdateBinLocationPayload extends CreateBinLocationPayload {
  binStatus: BinStatus;
}

export interface BinLocationMessageResponse {
  message: string;
}

export const getBinLocations = async (): Promise<BinLocationItemResponse[]> => {
  const { data } = await apiClient.get<BinLocationItemResponse[]>(
    "/api/BinLocation/get-bins",
  );
  return data;
};

export const getArchivedBinLocations = async (): Promise<
  BinLocationItemResponse[]
> => {
  const { data } = await apiClient.get<BinLocationItemResponse[]>(
    "/api/BinLocation/get-archived-bins",
  );
  return data;
};

export const getPublicBinLocationById = async (
  binId: string,
): Promise<BinLocationItemResponse> => {
  const { data } = await apiClient.get<BinLocationItemResponse>(
    `/api/BinLocation/public-bin/${binId}`,
  );
  return data;
};

export const createBinLocation = async (
  payload: CreateBinLocationPayload,
): Promise<BinLocationMessageResponse> => {
  const { data } = await apiClient.post<BinLocationMessageResponse>(
    "/api/BinLocation/create-bin",
    payload,
  );
  return data;
};

export const updateBinLocation = async (
  binId: string,
  payload: UpdateBinLocationPayload,
): Promise<BinLocationMessageResponse> => {
  const { data } = await apiClient.put<BinLocationMessageResponse>(
    `/api/BinLocation/update-bin/${binId}`,
    payload,
  );
  return data;
};

export const archiveBinLocation = async (
  binId: string,
): Promise<BinLocationMessageResponse> => {
  const { data } = await apiClient.delete<BinLocationMessageResponse>(
    `/api/BinLocation/archive-bin/${binId}`,
  );
  return data;
};

export const restoreBinLocation = async (
  binId: string,
): Promise<BinLocationMessageResponse> => {
  const { data } = await apiClient.put<BinLocationMessageResponse>(
    `/api/BinLocation/restore-bin/${binId}`,
  );
  return data;
};
