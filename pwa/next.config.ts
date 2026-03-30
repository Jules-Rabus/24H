import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  transpilePackages: [
    "@api-platform/admin",
    "@api-platform/api-doc-parser",
    "ra-core",
    "ra-data-simple-rest",
    "ra-i18n-polyglot",
    "ra-language-english",
    "ra-language-french",
    "react-admin",
  ],
};

export default nextConfig;
