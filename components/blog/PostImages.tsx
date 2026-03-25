"use client";

import Image from "next/image";

type Props = {
  images: string[];
  postId: string;
  priority?: boolean; // 🔥 thêm
};

export default function PostImages({ images, postId, priority = false }: Props) {
  const count = images.length;
  if (count === 0) return null;

  const group = `post-${postId}`;

  const visibleImages =
    count <= 4 ? images : images.slice(0, 4);

  const hiddenImages =
    count > 4 ? images.slice(4) : [];

  const renderImage = (
    img: string,
    i: number,
    className: string,
    sizes: string
  ) => (
    <a
      key={i}
      href={img}
      data-fancybox={group}
      className={`relative block ${className}`}
    >
      <Image
        src={img}
        alt="post"
        fill
        sizes={sizes}
        priority={priority && i === 0} // 🔥 CHỈ ảnh đầu tiên
        className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
      />
    </a>
  );

  return (
    <>
      {/* 1 IMAGE */}
      {count === 1 && (
        <div className="postImages relative w-full aspect-video mt-3 overflow-hidden select-none">
          {renderImage(images[0], 0, "w-full h-full", "(max-width:768px) 100vw, 800px")}
        </div>
      )}

      {/* 2 IMAGES */}
      {count === 2 && (
        <div className="postImages grid grid-cols-2 gap-[2px] m-0 mt-3 select-none">
          {visibleImages.map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3] overflow-hidden",
              "(max-width:768px) 50vw, 400px"
            )
          )}
        </div>
      )}

      {/* >=3 IMAGES */}
      {count >= 3 && (
        <div className="postImages grid grid-cols-2 gap-[2px] m-0 mt-3 select-none">
          {visibleImages.map((img, i) => (
            <div key={i} className="relative aspect-[4/3]">
              <a
                href={img}
                data-fancybox={group}
                className="relative block w-full h-full overflow-hidden"
              >
                <Image
                  src={img}
                  alt="post"
                  fill
                  sizes="(max-width:768px) 50vw, 400px"
                  priority={priority && i === 0} // 🔥 fix LCP
                  className="object-cover rounded-0 transition-transform duration-300 ease-in-out hover:scale-105"
                />
              </a>

              {i === 3 && count > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-normal pointer-events-none">
                  +{count - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {hiddenImages.length > 0 && (
        <div className="hidden">
          {hiddenImages.map((img, i) => (
            <a
              key={`hidden-${i}`}
              href={img}
              data-fancybox={group}
            />
          ))}
        </div>
      )}
    </>
  );
}