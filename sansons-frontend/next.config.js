/** @type {import('next').NextConfig} */
const nextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: "http://sansons-backend:8000/api/:path*/",
        },
        {
          source: "/media/:path*",
          destination: "http://sansons-backend:8000/media/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;
