"use client";

export default function PostActions() {
  return (
    <div className="postAction flex items-center gap-4 mt-4">
      <button className="cursor-pointer text-gray-600 hover:text-black">
        <i className="fa-duotone fa-heart" />
      </button>

      <button className="cursor-pointer text-gray-600 hover:text-black">
        <i className="fa-duotone fa-comment" />
      </button>

      <button className="cursor-pointer text-gray-600 hover:text-black">
        <i className="fa-duotone fa-share" />
      </button>
    </div>
  );
}