import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Önce Next.js ayarlarını (nextConfig) tanımlıyoruz
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // ZORUNLU: Capacitor'ın HTML/CSS/JS okuyabilmesi için
  images: {
    unoptimized: true, // ZORUNLU: Statik export'ta resimlerin bozulmaması için
  },
};

// 2. Sonra PWA ayarlarını tanımlıyoruz
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // DÜZELTME: Normalde veya mobil için (CAPACITOR_BUILD) derlenirken PWA'yı kapatıyoruz
  disable: process.env.NODE_ENV === "development" || process.env.CAPACITOR_BUILD === "true",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'quran-api-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/quranenc\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'quranenc-api-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /^https:\/\/quran\.islam-db\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'quran-images-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      }
    ],
  },
});

// 3. En sonda ikisini birleştirip dışa aktarıyoruz
export default withPWA(nextConfig);