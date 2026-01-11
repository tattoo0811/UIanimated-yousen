import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: false, // Disable Turbopack due to Japanese path issue
};

export default nextConfig;
