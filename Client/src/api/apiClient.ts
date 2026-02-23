import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5017/api",
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

export default apiClient;
