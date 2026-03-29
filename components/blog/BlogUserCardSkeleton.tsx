export default function BlogUserCardSkeleton({
  className = "mb-8",
}: {
  className?: string;
}) {
  return (
    <div
      className={`userWrap ${className} flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md
      border border-white/70 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] animate-pulse`}
    >
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />

        {/* Name + Email */}
        <div className="space-y-2">
          <div className="h-4 w-28 rounded-full bg-gray-200" />
          <div className="h-3.5 w-36 rounded-full bg-gray-100" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="w-11 h-11 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}