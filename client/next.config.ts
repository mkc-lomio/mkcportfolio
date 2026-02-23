import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // uncomment this line if you want to export a static site
  images: {
    unoptimized: true,
  },
};

export default nextConfig;