import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configurations de production de Next.js.
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Only apply this for server-side builds
    if (isServer) {
      config.externals = [
        ...(config.externals || []), // Preserve existing externals
        // 'better-sqlite3', // Removed better-sqlite3 as it's no longer used
      ];
    }
    return config;
  },
};

export default nextConfig;