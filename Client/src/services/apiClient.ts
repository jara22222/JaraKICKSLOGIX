import axios from "axios";
import { toast } from "sonner";

const apiClient = axios.create({
  baseURL: "http://localhost:5017/",
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
    const responseData = error?.response?.data;
    const validationErrors = responseData?.errors;

    const firstValidationError =
      validationErrors && typeof validationErrors === "object"
        ? Object.values(validationErrors).flat().find((msg) => Boolean(msg))
        : null;

    const message =
      firstValidationError ||
      responseData?.title ||
      responseData?.message ||
      error?.message ||
      "Request failed. Please try again.";

    toast.error(String(message));
    return Promise.reject(error);
  }
);

export default apiClient;
