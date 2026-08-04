/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "**" }, // relax for CMS/media-library driven image hosts; tighten in production
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
