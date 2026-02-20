import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Önce Next.js ayarlarını (nextConfig) tanımlıyoruz
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Eğer başka next.js ayarların varsa buraya ekleyebilirsin
};

// 2. Sonra PWA ayarlarını tanımlıyoruz
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Geliştirme aşamasında (npm run dev) kapalı
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Kuran Orijinal Metin API'sini Cihaza Kaydet
      {
        urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'quran-api-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 Gün
        },
      },
      // Kuran Kürtçe/Meal API'sini Cihaza Kaydet
      {
        urlPattern: /^https:\/\/quranenc\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'quranenc-api-cache',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 Gün
        },
      },
      // Kuran Sayfa Resimlerini (Images) Cihaza Kaydet
      {
        urlPattern: /^https:\/\/quran\.islam-db\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'quran-images-cache',
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 Gün
        },
      }
    ],
  },
});

// 3. En sonda ikisini birleştirip dışa aktarıyoruz
export default withPWA(nextConfig);