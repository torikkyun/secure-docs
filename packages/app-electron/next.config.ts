import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Use static export only for production builds. In dev, let Next run normally.
  ...(isDev ? {} : { output: "export" }),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
