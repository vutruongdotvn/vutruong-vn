import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "frqouslfjppnpcpgrhjd.supabase.co",
      "ui-avatars.com",
      "res.cloudinary.com",
    ],

    // Ảnh responsive lớn: post image, cover, card...
    deviceSizes: [640, 750, 828, 1080],

    // Ảnh nhỏ: avatar, thumbnail, icon...
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;