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
    ],

    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;