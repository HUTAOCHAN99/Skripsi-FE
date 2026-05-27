import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',  // Penting untuk Docker
  images: {
    unoptimized: true,   // Untuk Cloud Run
  },
};

export default nextConfig;
