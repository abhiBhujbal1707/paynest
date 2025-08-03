/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // ✅ Still valid
    },
  },
  turbopack: {
    // Optional: you can add Turbopack-specific configs here
  },
  typescript: {
    ignoreBuildErrors: false, // ✅ Keep as-is
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ Speeds up dev workflow
  },
};

export default nextConfig;
