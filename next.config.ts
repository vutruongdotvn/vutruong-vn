import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "frqouslfjppnpcpgrhjd.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "img.ophim.live",
      },
      {
        protocol: "https",
        hostname: "ophim1.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],

    formats: ["image/avif", "image/webp"],

    deviceSizes: [640, 768, 828, 1080],
    imageSizes: [80, 160, 240, 400, 420, 800, 860, 960],

    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 ngày
  },
};

export default nextConfig;