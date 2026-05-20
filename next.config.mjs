import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["utfs.io", "res.cloudinary.com"],
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required for uploadthing
    
    config.resolve.alias = {
      ...config.resolve.alias,
      "next-auth/providers/credentials": path.resolve(__dirname, "lib/dummy.ts"),
      "next-auth/jwt": path.resolve(__dirname, "lib/dummy.ts"),
      "next-auth/react": path.resolve(__dirname, "lib/auth-client.tsx"),
      "next-auth": path.resolve(__dirname, "lib/auth-server.ts"),
    };
    
    return config;
  },
};

export default nextConfig;
