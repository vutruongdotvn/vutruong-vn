"use client";

import Image from "next/image";
import Link from "next/link";
import PostImages from "./PostImages";

type PostCardProps = {
  id: string;
  author: string;
  time: string;
  content: string;
  images?: string[];
};

export default function PostCard({
  id,
  author,
  time,
  content,
  images = [],
}: PostCardProps) {
  return (
      <div className="bg-white lg:rounded-lg rounded-0 shadow-sm p-4 hover:shadow-md transition">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/avatar.JPEG"
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full"
            />

            <div className="leading-6">
              <Link href={`/bio`}>
              <span className="font-semibold text-gray-900">{author}</span>
              </Link>
              <Link href={`/blog/${id}`} className="block group">
              <span className="block text-sm text-gray-500 hover:text-gray-800 font-normal">{time}</span>
              </Link>
            </div>
          </div>

          <button
            onClick={(e) => e.preventDefault()}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="fa-duotone fa-ellipsis"></i>
          </button>
        </div>

        {/* CONTENT */}
        <p className="mt-3 text-gray-800 leading-relaxed">
          {content}
        </p>

        {/* IMAGES */}
        <PostImages images={images} postId={id} />

      </div>
  );
}