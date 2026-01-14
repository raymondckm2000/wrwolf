import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Werewolf Host Assistant",
        short_name: "Werewolf Host",
        theme_color: "#0f1115",
        background_color: "#0f1115",
        display: "standalone",
        scope: "/",
        start_url: "/"
      }
    })
  ]
});
