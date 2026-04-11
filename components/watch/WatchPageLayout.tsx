import WatchGrid from "./WatchGrid";
import Pagination from "./Pagination";

function formatNumber(num: number) {
  return new Intl.NumberFormat("vi-VN").format(num);
}

type Props = {
  title: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  baseUrl: string;
  items: any[];
  prefix: string;
};

export default function WatchPageLayout({
  title,
  currentPage,
  totalPages,
  totalItems,
  baseUrl,
  items,
  prefix,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[1800px] py-36 px-4">
      <h1 className="text-xl font-semibold">
        {prefix}: {title}
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        Trang {currentPage}/{totalPages} • Tổng:{" "}
        {formatNumber(totalItems)} kết quả
      </p>

      <WatchGrid items={items} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={baseUrl}
      />
    </div>
  );
}