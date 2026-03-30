export default function BlogUserCardSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`
        userWrap
        fixed left-1/2 -translate-x-1/2 bottom-0 z-50
        w-[calc(100%-24px)] max-w-md
        ${className}
      `}
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="
          flex items-center justify-between gap-3
          rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md
          shadow-[0_8px_30px_rgba(0,0,0,0.04)]
          px-4 py-3 animate-pulse
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-full bg-gray-200 shrink-0" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-28 rounded-full bg-gray-200" />
            <div className="h-3.5 w-36 max-w-full rounded-full bg-gray-100" />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-11 h-11 rounded-full bg-gray-200" />
          <div className="w-11 h-11 rounded-full bg-gray-100" />
        </div>
      </div>
    </div>
  );
}