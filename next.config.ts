import type { NextConfig } from "next";
import path from "path";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['localhost:3005'];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.INTERNAL_API_URL || 'http://localhost:3000'}/api/:path*`,
      },
    ];
  },
  turbopack: {
    root: path.resolve(__dirname, '../../'),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
