import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    https: {},
    allowedHosts: ["cool-ocean-a9e78298.tunnl.gg"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
