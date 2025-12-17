/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io"],
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required for uploadthing
    return config;
  },
};

export default nextConfig;
