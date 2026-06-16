import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^\/api\/schedule.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "schedule-cache",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /^\/api\/activities.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "activities-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 4 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {};

export default withPWA(nextConfig);
