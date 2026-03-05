import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

const backendTarget = process.env.VITE_PROXY_TARGET ?? "https://127.0.0.1:7112";
const hubWsTarget = process.env.VITE_HUB_WS_TARGET ?? "http://127.0.0.1:5017";

const proxyWithWs = {
  target: hubWsTarget,
  changeOrigin: true,
  secure: false,
  ws: true,
};

const proxyHttpOnly = {
  target: backendTarget,
  changeOrigin: true,
  secure: false,
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    https: {},
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "cool-ocean-a9e78298.tunnl.gg"],
    proxy: {
      "/api": {
        ...proxyHttpOnly,
      },
      "/supplierHub": {
        ...proxyWithWs,
      },
      "/managerHub": {
        ...proxyWithWs,
      },
      "/update-managerHub": {
        ...proxyWithWs,
      },
      "/archive-managerHub": {
        ...proxyWithWs,
      },
      "/getAll-managerHub": {
        ...proxyWithWs,
      },
      "/search-managerHub": {
        ...proxyWithWs,
      },
      "/branchAccount-managerHub": {
        ...proxyWithWs,
      },
      "/branch-notificationHub": {
        ...proxyWithWs,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
