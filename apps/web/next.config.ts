import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion", "@radix-ui"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  transpilePackages: [
    "@fittrack/config",
    "@fittrack/types",
    "@fittrack/utils",
    "@fittrack/validation",
    "@fittrack/business-logic",
    "@fittrack/supabase",
    "@fittrack/ui",
  ],
}

export default nextConfig
