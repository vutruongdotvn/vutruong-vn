import Link from "next/link";
import Image from "next/image";

export default function WatchFooter() {
  const features = [
    { icon: "fa-bolt", label: "Miễn phí" },
    { icon: "fa-gauge-high", label: "Tốc độ cao" },
    { icon: "fa-badge-check", label: "Không quảng cáo" },
    { icon: "fa-arrows-rotate", label: "Cập nhật mỗi ngày" },
  ];

  return (
    <footer className="relative select-none pb-12">
      <div className="mx-auto flex w-full max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <div
          className="
            relative w-full overflow-hidden rounded-[32px]
            border border-white/10 bg-black/20
            shadow-[0_18px_60px_rgba(0,0,0,0.3)]
            backdrop-blur-xl
          "
        >
          {/* ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)]" />
          <div className="pointer-events-none absolute -top-16 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center justify-around lg:justify-between">
              {/* Brand */}
              <div className="min-w-0">
                <Link href="/watch" className="inline-flex items-center gap-2">
                  <div
                    className="relative
                      flex size-9 items-center justify-center
                    "
                  >
                    <Image alt="logo" className="object-cover" unoptimized fill sizes="15px" src="/logo-white.png"/>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold tracking-wide text-white">
                      Watch
                    </div>
                  </div>
                </Link>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {features.map((item) => (
                  <span
                    key={item.label}
                    className="
                      inline-flex items-center gap-2 rounded-full
                      border border-white/10 bg-white/[0.04]
                      px-3.5 py-2 text-xs text-white/75
                      backdrop-blur-md
                    "
                  >
                    <i className={`fa-duotone ${item.icon} text-base text-olive-300`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-2 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span>Toàn bộ dữ liệu được fetch từ API, không lưu trữ tại server.</span>
                </div>

                <p>© {new Date().getFullYear()} VT Watch</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}