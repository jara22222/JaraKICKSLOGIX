import axios from "axios";
import { API_BASE_URL } from "@/shared/config/api";
import { showErrorToast } from "@/shared/lib/toast";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add Bearer Token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isCanceledRequest =
      error?.code === "ERR_CANCELED" ||
      error?.message === "canceled" ||
      axios.isCancel(error);
    if (isCanceledRequest) {
      return Promise.reject(error);
    }

    const requestConfig = (error?.config ?? {}) as {
      suppressErrorToast?: boolean;
    };
    const shouldSuppressErrorToast = Boolean(requestConfig.suppressErrorToast);

    const responseData = error?.response?.data;
    const validationErrors = responseData?.errors;
    const identityErrors = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData?.errors)
        ? responseData.errors
        : null;

    const firstValidationError =
      validationErrors && typeof validationErrors === "object"
        ? Object.values(validationErrors).flat().find((msg) => Boolean(msg))
        : null;

    const firstIdentityError =
      identityErrors?.find(
        (entry: any) => entry?.description || entry?.Description,
      )?.description ??
      identityErrors?.find(
        (entry: any) => entry?.description || entry?.Description,
      )?.Description;

    const message =
      firstIdentityError ||
      firstValidationError ||
      responseData?.title ||
      responseData?.message ||
      error?.message ||
      "Request failed. Please try again.";

    if (!shouldSuppressErrorToast) {
      showErrorToast(String(message));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
