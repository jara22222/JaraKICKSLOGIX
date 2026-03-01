const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");
const DEPLOYED_BACKEND_URL = "https://kickslogix-backend.runasp.net";

const FRONTEND_ORIGINS = new Set([
  "http://localhost:5173",
  "https://localhost:5173",
  "https://jara-kickslogix.vercel.app",
  "http://192.168.56.1:5173",
  "https://192.168.56.1:5173",
  "http://192.168.254.131:5173",
  "https://192.168.254.131:5173",
]);

const resolveApiBaseUrl = () => {
  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (explicitBaseUrl) return normalizeBaseUrl(explicitBaseUrl);

  if (typeof window !== "undefined") {
    const currentOrigin = normalizeBaseUrl(window.location.origin);
    const apiPort = window.location.protocol === "https:" ? "7112" : "5017";
    const hostBasedApi = `${window.location.protocol}//${window.location.hostname}:${apiPort}`;

    if (currentOrigin === "https://jara-kickslogix.vercel.app") {
      return DEPLOYED_BACKEND_URL;
    }

    // For local/LAN frontend origins, use the same host on API ports.
    if (FRONTEND_ORIGINS.has(currentOrigin)) {
      return normalizeBaseUrl(hostBasedApi);
    }
  }

  return DEPLOYED_BACKEND_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();

export const getHubUrl = (hubPath: string) =>
  `${API_BASE_URL}/${hubPath.replace(/^\/+/, "")}`;
