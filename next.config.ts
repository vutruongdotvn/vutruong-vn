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
        hostname: "res.cloudinary.com",
      },
    ],

    formats: ["image/avif", "image/webp"],

    deviceSizes: [640, 768, 828, 1080],
    imageSizes: [80, 160, 240, 400, 420, 800, 860, 960],

    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 ngày
  },

  // Chuyển hướng từ SERVER
  async redirects() {
    return [
      {
        source: "/menu",
        destination: "https://menu.vutruong.vn",
        permanent: false,
      },
      {
        source: "/about",
        destination: "/blog/about",
        permanent: false,
      },
      {
        source: "/contact",
        destination: "/blog/contact",
        permanent: false,
      },
      {
        source: "/locket",
        destination: "https://locket.camera/links/UJpdrfjVHXXhmNe68",
        permanent: false,
      },
      {
        source: "/fb",
        destination: "https://www.facebook.com/100014201562904",
        permanent: false,
      },
      {
        source: "/tiktok",
        destination: "https://www.tiktok.com/@vutruong.vn",
        permanent: false,
      },
      {
        source: "/instagram",
        destination: "https://www.instagram.com/vutruong.vn",
        permanent: false,
      },
      {
        source: "/threads",
        destination: "https://www.threads.com/vutruong.vn",
        permanent: false,
      },
      {
        source: "/x",
        destination: "https://www.x.com/vutruong.vn",
        permanent: false,
      },
      {
        source: "/blog/post",
        destination: "/blog",
        permanent: false,
      },
    ];
  },

};

export default nextConfig;