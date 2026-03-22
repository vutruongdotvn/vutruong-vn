"use client";

import Image from "next/image";

type Props = {
  images: string[];
  postId: string;
};

export default function PostImages({ images, postId }: Props) {
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
        className="object-cover rounded-xl"
      />
    </a>
  );

  return (
    <>
      {/* 1 IMAGE */}
      {count === 1 && (
        <div className="relative w-full aspect-video mt-3">
          {renderImage(images[0], 0, "w-full h-full", "100vw")}
        </div>
      )}

      {/* 2 IMAGES */}
      {count === 2 && (
        <div className="grid grid-cols-2 gap-1 m-0 mt-3">
          {visibleImages.map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3]",
              "(max-width:768px) 50vw, 400px"
            )
          )}
        </div>
      )}

      {/* >=3 IMAGES */}
      {count >= 3 && (
        <div className="grid grid-cols-2 gap-1 m-0 mt-3">
          {visibleImages.map((img, i) => (
            <div key={i} className="relative aspect-[4/3]">
              <a
                href={img}
                data-fancybox={group}
                className="block w-full h-full"
              >
                <Image
                  src={img}
                  alt="post"
                  fill
                  sizes="(max-width:768px) 50vw, 400px"
                  className="object-cover rounded-lg"
                />
              </a>

              {/* +N overlay */}
              {i === 3 && count > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl font-semibold rounded-lg">
                  +{count - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 ONLY hidden remaining images */}
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