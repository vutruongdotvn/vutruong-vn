import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  const range = 3;

  const start = Math.max(2, currentPage - range);
  const end = Math.min(totalPages - 1, currentPage + range);

  pages.push(1);

  if (start > 2) pages.push("start-ellipsis");

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages - 1) pages.push("end-ellipsis");

  if (totalPages > 1) pages.push(totalPages);

  const buildUrl = (page: number) => {
    return baseUrl.includes("?")
      ? `${baseUrl}&page=${page}`
      : `${baseUrl}?page=${page}`;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
      {/* Prev */}
      {currentPage > 1 && (
        <Link
          href={buildUrl(currentPage - 1)}
          className="p-3 rounded-lg border border-white/20 hover:bg-white/10 active:scale-95"
        >
          <i className="fa-duotone fa-arrow-left text-sm" />
        </Link>
      )}

      {/* Pages */}
      {pages.map((p, i) => {
        if (typeof p === "string") {
          return (
            <span key={`${p}-${i}`} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        return (
          <Link
            key={`page-${p}`}
            href={buildUrl(p)}
            className={`py-3 px-4 rounded-lg text-sm border active:scale-95 ${
              p === currentPage
                ? "bg-white text-black"
                : "border-white/20 hover:bg-white/10"
            }`}
          >
            {p}
          </Link>
        );
      })}

      {/* Next */}
      {currentPage < totalPages && (
        <Link
          href={buildUrl(currentPage + 1)}
          className="p-3 rounded-lg border border-white/20 hover:bg-white/10 active:scale-95"
        >
          <i className="fa-duotone fa-arrow-right text-sm" />
        </Link>
      )}
    </div>
  );
}