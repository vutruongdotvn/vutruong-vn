import Link from "next/link";

export default function WatchFooter() {
  const features = [
    { icon: "fa-bolt", label: "Miễn phí" },
    { icon: "fa-gauge-high", label: "Tốc độ cao" },
    { icon: "fa-badge-check", label: "Không quảng cáo" },
    { icon: "fa-arrows-rotate", label: "Cập nhật liên tục" },
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
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              {/* Brand */}
              <div className="min-w-0">
                <Link href="/watch" className="inline-flex items-center gap-3">
                  <div
                    className="
                      flex h-11 w-11 items-center justify-center rounded-full
                      border border-white/10 bg-white/5 text-cyan-300
                      shadow-[0_0_30px_rgba(34,211,238,0.08)]
                    "
                  >
                    <i className="fa-duotone fa-clapperboard-play text-base" />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold tracking-wide text-white">
                      VT Watch
                    </div>
                    <p className="mt-0.5 text-sm text-white/55">
                      Xem phim miễn phí, nhanh, gọn, mượt.
                    </p>
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
                    <i className={`fa-duotone ${item.icon} text-[11px] text-cyan-300`} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="flex flex-col gap-2 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <i className="fa-duotone fa-database text-[11px] text-cyan-300/80" />
                  <span>Lấy dữ liệu từ API • Không lưu trữ dữ liệu phim trên server</span>
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