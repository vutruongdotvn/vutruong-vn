"use client";

export default function PostActions() {
  return (
    <div className="postAction flex items-center gap-3 p-3">
      {/* <button className="cursor-pointer text-gray-600 hover:text-black" title="Thích">
        <i className="fa-duotone fa-heart" />
      </button>

      <button className="cursor-pointer text-gray-600 hover:text-black" title="Bình luận">
        <i className="fa-duotone fa-comment" />
      </button>
      */}

      <button className="cursor-pointer text-gray-600 hover:text-black" title="Chia sẻ">
        <i className="fa-duotone fa-share" />
      </button>
    </div>
  );
}