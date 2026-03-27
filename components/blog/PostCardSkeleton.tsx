export default function PostCardSkeleton() {
  return (
    <div className="relative">
      <div className="grid grid-cols-[56px_1fr] gap-2 md:gap-3 animate-pulse">
        {/* LEFT TIMELINE */}
        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative z-20 mt-3 w-10 h-10 rounded-full bg-gray-300" />

          {/* Line */}
          <div className="absolute top-14 bottom-[-10px] w-[2px] bg-gradient-to-b from-gray-200 via-gray-200 to-gray-200 z-0" />

          {/* Dot */}
          <div className="relative z-10 mt-3 size-3 rounded-full bg-gray-300 border-2 border-white shadow-sm" />
        </div>

        {/* RIGHT CONTENT */}
        <div className="pb-10 pt-2">
          <div className="w-full rounded-2xl bg-white/80 border border-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-24 h-4 bg-gray-300 rounded-xl" />
              <div className="w-20 h-4 bg-gray-200 rounded-xl" />
            </div>

            {/* Text */}
            <div className="space-y-3">
              <div className="w-[82%] h-4 bg-gray-300 rounded-xl" />
              <div className="w-[92%] h-4 bg-gray-300 rounded-xl" />
              <div className="w-[70%] h-4 bg-gray-200 rounded-xl" />
            </div>

            {/* Image */}
            <div className="bg-gray-200 w-full aspect-video rounded-2xl mt-5" />

            {/* Actions */}
            <div className="flex gap-4 mt-5 pt-4 border-t border-gray-100">
              <div className="w-5 h-5 rounded-full bg-gray-200" />
              <div className="w-5 h-5 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}