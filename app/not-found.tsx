import Link from "next/link";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

export default function NotFound() {
  return (
    <>
      <title>Lỗi!</title>

      <main className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16">

        <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center">
          <PremiumGlassCard
            className="w-screen max-w-2xl"
            contentClassName="p-10 sm:p-12 text-center"
          >
            {/* Badge */}
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full text-red-600 border border-red-300 bg-red-100 px-4 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur">
                <i className="fa-duotone fa-triangle-exclamation text-red-500" />
                404
              </span>
            </div>

            {/* Main Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-white/60 bg-white/50 shadow-sm">
                <i className="fa-duotone fa-file-circle-question text-4xl text-neutral-800" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              Lỗi rồi! <i className="far fa-face-pensive"/>
            </h1>

            {/* Description */}
            <div className="mt-5 space-y-2">
              <p className="mx-auto max-w-2xl text-sm leading-7 text-neutral-500 md:text-base">
                Trang này không tồn tại, có thể đã bị xóa,<br/>thay đổi URL hoặc bạn không có quyền truy cập.
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <i className="fa-duotone fa-house" />
                Trang chủ
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-black/15 px-5 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
              >
                <i className="fa-duotone fa-envelope" />
                Liên hệ
              </Link>
            </div>
          </PremiumGlassCard>
        </div>
      </main>
    </>
  );
}