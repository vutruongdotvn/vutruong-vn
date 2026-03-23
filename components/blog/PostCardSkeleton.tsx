export default function PostCardSkeleton() {
  return (
    <div className="w-full rounded-2xl bg-white shadow-sm border border-gray-200 p-4 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-300" />

        {/* Name + time */}
        <div className="space-y-2">
          <div className="w-32 h-3 bg-gray-300 rounded-lg" />
          <div className="w-20 h-2 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* 3 dòng text */}
      <div className="space-y-2">
        <div className="w-full h-3 bg-gray-300 rounded-lg" />
        <div className="w-5/6 h-3 bg-gray-300 rounded-lg" />
        <div className="w-2/3 h-3 bg-gray-300 rounded-lg" />
      </div>
      <div className="skeImg bg-gray-200 w-full h-50 rounded-lg mt-3"/>
    </div>
  );
}