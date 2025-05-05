import type { NextConfig } from "next";
import './app/cronJob';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config: any) => ({ ...config, watchOptions: { poll: 1000 } }),
};

export default nextConfig;
