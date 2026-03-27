export default function PostCardSkeleton() {
  return (
    <div className="w-full rounded-0 lg:rounded-xl bg-white shadow-xs p-3 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-300" />

        {/* Name + time */}
        <div className="space-y-2 flex">
          <div className="w-32 h-3 bg-gray-300 rounded-xl" />
        </div>
      </div>

      {/* 2 dòng text */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-gray-300 rounded-xl" />
        <div className="w-3/6 h-3 bg-gray-300 rounded-xl" />
      </div>
      <div className="skeImg bg-gray-200 w-full aspect-video rounded-xl mt-3"/>
    </div>
  );
}