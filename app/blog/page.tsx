import GlassCard from "@/components/home/GlassCard";
import BackgroundGlow from "@/components/home/BackgroundGlow";
import Image from "next/image";

export const metadata = {
  title: "Blog",
  description: "Blog cá nhân - Lưu giữ những điều đẹp đẽ và giá trị",
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">

      {/* Background */}
      <BackgroundGlow />

      {/* Card */}
      <GlassCard>
        <div className="text-center space-y-6">

          {/* Logo */}
          <div className="flex justify-center">
            <a href="/">
              <Image src="/logo.png" alt="logo" width={70} height={70} priority />
            </a>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Blog
          </h1>

          {/* Message */}
          <p className="text-gray-600 text-base">
            Blog đang được xây dựng 🚧
          </p>

          {/* Sub message */}
          <p className="text-sm text-gray-400">
            Chưa biết viết gì ở đây cả 😎
          </p>

        </div>
      </GlassCard>
    </main>
  );
}