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

  // Chuyển hướng QR Order từ Quán ăn Vũ Trường đến Link QR Order của SapoFnB
  async redirects() {
    return [
      {
        source: "/qr/1",
        destination: "https://link-ban-1.com",
        permanent: false,
      },
      {
        source: "/qr/2",
        destination: "https://link-ban-2.com",
        permanent: false,
      },
      {
        source: "/qr/3",
        destination: "https://link-ban-3.com",
        permanent: false,
      },
      {
        source: "/qr/4",
        destination: "https://link-ban-4.com",
        permanent: false,
      },
      {
        source: "/qr/5",
        destination: "https://link-ban-5.com",
        permanent: false,
      },
      {
        source: "/qr/6",
        destination: "https://link-ban-6.com",
        permanent: false,
      },
      {
        source: "/qr/7",
        destination: "https://link-ban-7.com",
        permanent: false,
      },
      {
        source: "/qr/8",
        destination: "https://link-ban-8.com",
        permanent: false,
      },
      {
        source: "/qr/9",
        destination: "https://link-ban-9.com",
        permanent: false,
      },
      {
        source: "/qr/10",
        destination: "https://link-ban-10.com",
        permanent: false,
      },
      {
        source: "/menu",
        destination: "https://menu.vutruong.vn",
        permanent: false,
      },
    ];
  },

};

export default nextConfig;