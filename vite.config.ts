import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Moonlog — Werewolf Assistant",
        short_name: "Moonlog",
        description: "Private, deterministic Werewolf game tracking.",
        theme_color: "#171914",
        background_color: "#f3f0e7",
        display: "standalone",
        scope: "/",
        start_url: "/"
      }
    })
  ],
  test: {
    environment: "node"
  }
});
