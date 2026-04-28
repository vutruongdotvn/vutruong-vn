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
          className="max-w-3xl w-full"
          contentClassName="text-center"
        >
          {/* Main Icon */}
          <div className="mb-6 flex justify-center">
            <div className="size-16 flex items-center mx-auto justify-center rounded-full bg-red-50 border border-red-200">
              <i className="fa-duotone fa-file-circle-question text-3xl text-red-500" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Lỗi rồi! <i className="far fa-face-pensive" />
          </h1>

          {/* Description */}
          <div className="mt-4 mb-6 space-y-1.5">
            <p className="mx-auto max-w-2xl text-sm leading-7 text-neutral-500 md:text-base">
              Trang này không tồn tại, có thể đã bị xóa,<br />thay đổi URL hoặc bạn không có quyền truy cập.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black active:scale-95"
            >
              <i className="fa-duotone fa-house" />
              Trang chủ
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-black/10 px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black/15 active:scale-95"
            >
              <i className="fa-duotone fa-envelope" />
              Liên hệ
            </Link>
          </div>
        </PremiumGlassCard>
      </main>
    </>
  );
}