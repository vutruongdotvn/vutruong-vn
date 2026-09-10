import Link from "next/link";
import type { Metadata } from "next";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

export const metadata: Metadata = {
  title: "Lỗi!",
  description: "Lỗi 404 - Page not found!",
  robots: "noindex, nofollow", // Cấm Bot Google index
};
export default function NotFound() {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center">

        <PremiumGlassCard
          className="max-w-4xl w-full"
          contentClassName="text-center px-4 py-18"
        >
          {/* Main Icon */}
          <div className="mb-6 flex justify-center">
            <div className="size-16 flex items-center mx-auto justify-center rounded-full bg-red-50 dark:bg-red-400/15 border border-red-200 dark:border-red-400/25">
              <i className="fa-duotone fa-file-circle-question text-3xl text-red-500" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Trang không tồn tại!
          </h1>

          {/* Description */}
          <div className="mt-1 mb-6 space-y-1.5">
            <p className="mx-auto max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Có thể đã bị xóa hoặc đã chuyển sang địa chỉ khác.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-3 justify-center px-6 py-3 mx-auto bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95 w-sm max-w-full"
            >
              <i className="fad fa-arrow-left" />
              Về trang chủ
            </Link>
          </div>
        </PremiumGlassCard>
      </main>
    </>
  );
}