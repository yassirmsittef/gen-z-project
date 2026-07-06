import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle : imports lucide-react (barrel) tree-shakés automatiquement.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
