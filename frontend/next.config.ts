import type { NextConfig } from "next";

const minioInternal = process.env.MINIO_INTERNAL_URL ?? "http://localhost:9000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/marka/:path*",
        destination: `${minioInternal}/marka/:path*`,
      },
    ];
  },
};

export default nextConfig;
