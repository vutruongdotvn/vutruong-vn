"use client";

type PostCardProps = {
  author: string;
  time: string;
  content: string;
  images?: string[];
};

export default function PostCard({
  author,
  time,
  content,
  images = [],
}: PostCardProps) {
  const renderImages = () => {
    const count = images.length;

    // 1 ảnh
    if (count === 1) {
      return (
        <div className="mt-4">
          <div className="bg-gray-200 h-[400px] rounded-xl" />
        </div>
      );
    }

    // 2 ảnh
    if (count === 2) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((_, i) => (
            <div key={i} className="bg-gray-200 h-[250px] rounded-xl" />
          ))}
        </div>
      );
    }

    // 3 ảnh (1 lớn + 2 nhỏ)
    if (count === 3) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-200 h-[300px] rounded-xl col-span-2" />
          <div className="bg-gray-200 h-[200px] rounded-xl" />
          <div className="bg-gray-200 h-[200px] rounded-xl" />
        </div>
      );
    }

    // 4 ảnh
    if (count === 4) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((_, i) => (
            <div key={i} className="bg-gray-200 h-[200px] rounded-xl" />
          ))}
        </div>
      );
    }

    // >4 ảnh (có overlay +X)
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((_, i) => (
          <div key={i} className="relative">
            <div className="bg-gray-200 h-[200px] rounded-xl" />

            {i === 3 && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white text-2xl font-semibold">
                +{count - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300" />

          <div>
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-xs text-gray-500">{time}</p>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600">
          •••
        </button>
      </div>

      {/* CONTENT */}
      <p className="mt-3 text-gray-800">{content}</p>

      {/* IMAGES */}
      {renderImages()}

      {/* ACTIONS */}
      <div className="flex items-center justify-around text-sm text-gray-500 mt-4 pt-3 border-t">
        <span>❤️ 125</span>
        <span>💬 3</span>
        <span>Share</span>
      </div>
    </div>
  );
}