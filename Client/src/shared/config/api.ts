const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");
// Intentionally blank fallback for production. Set VITE_API_BASE_URL/VITE_HUB_BASE_URL.
const DEPLOYED_BACKEND_URL = "";

const isLocalOrLanHost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname === "0.0.0.0" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("10.") ||
  hostname.startsWith("172.16.") ||
  hostname.startsWith("172.17.") ||
  hostname.startsWith("172.18.") ||
  hostname.startsWith("172.19.") ||
  hostname.startsWith("172.2");

const forceHttpsWhenPageIsHttps = (value: string) => {
  const normalized = normalizeBaseUrl(value);
  if (typeof window === "undefined" || window.location.protocol !== "https:") {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return normalizeBaseUrl(url.toString());
    }
  } catch {
    // Leave relative values (e.g. "") untouched.
  }

  return normalized;
};

const FRONTEND_ORIGINS = new Set([
  "http://localhost:5173",
  "https://localhost:5173",
  "http://192.168.56.1:5173",
  "https://192.168.56.1:5173",
  "http://192.168.254.131:5173",
  "https://192.168.254.131:5173",
]);

const resolveApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const currentOrigin = normalizeBaseUrl(window.location.origin);
    const currentHost = window.location.hostname;

    // For local/LAN dev origins, use same-origin requests and let Vite proxy to backend.
    if (FRONTEND_ORIGINS.has(currentOrigin) || isLocalOrLanHost(currentHost)) {
      return "";
    }
  }

  const explicitBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (explicitBaseUrl) return forceHttpsWhenPageIsHttps(explicitBaseUrl);

  return forceHttpsWhenPageIsHttps(DEPLOYED_BACKEND_URL);
};

export const API_BASE_URL = resolveApiBaseUrl();
const resolveHubBaseUrl = () => {
  if (typeof window !== "undefined" && isLocalOrLanHost(window.location.hostname)) {
    return "";
  }

  const explicitHubBaseUrl = import.meta.env.VITE_HUB_BASE_URL;
  if (explicitHubBaseUrl) return forceHttpsWhenPageIsHttps(explicitHubBaseUrl);

  return forceHttpsWhenPageIsHttps(API_BASE_URL || DEPLOYED_BACKEND_URL);
};

export const HUB_BASE_URL = resolveHubBaseUrl();

export const getHubUrl = (hubPath: string) =>
  HUB_BASE_URL
    ? `${HUB_BASE_URL}/${hubPath.replace(/^\/+/, "")}`
    : `/${hubPath.replace(/^\/+/, "")}`;
