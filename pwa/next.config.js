/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  eslint: {
    dirs: ["components", "config", "pages", "public", "styles"],
  },
};

module.exports = nextConfig;
