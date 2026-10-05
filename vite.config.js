import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Web Bluetooth API hanya berjalan di konteks "secure context" (HTTPS atau
// localhost). Vite dev server default (localhost) sudah aman untuk testing.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "XYZ Thermal — Cetak Resi Bluetooth",
        short_name: "XYZ Thermal",
        description: "Cetak resi marketplace langsung dari browser ke printer thermal Bluetooth. Bisa offline, tanpa aplikasi tambahan.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: "#E1552F",
        background_color: "#F4F2EC",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Font Google di-cache offline (StaleWhileRevalidate) supaya tampil
        // tetap sama saat dibuka tanpa jaringan.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-styles", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/api\.fontshare\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "fontshare-styles", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            // File font (woff2) dari CDN Fontshare — tanpanya aplikasi terlihat
            // beda saat dijalankan offline.
            urlPattern: /^https:\/\/cdn\.fontshare\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "fontshare-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["pdfjs-dist"],
  },
  server: {
    host: true, // agar bisa diakses dari HP di jaringan yang sama (opsional)
  },
});
