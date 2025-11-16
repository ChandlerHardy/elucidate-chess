import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@elucidate/ui"],
  images: {
    domains: ["lichess.org", "chess.com"],
  },
};

export default nextConfig;
