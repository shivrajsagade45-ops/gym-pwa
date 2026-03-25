import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { VitePWA } from "vite-plugin-pwa";

import { cloudflare } from "@cloudflare/vite-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), VitePWA({
    registerType: "autoUpdate",

    manifest: {
      name: "Gym Manager",
      short_name: "Gym",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#1976d2",

      icons: [
        {
          src: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  }), cloudflare()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});