"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import WatchPageLayout from "@/components/watch/WatchPageLayout";

export default function ClientSearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page")) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) { router.push("/watch"); return; }
    let isMounted = true;
    setLoading(true);
    fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${q}&page=${page}`)
      .then(res => res.json())
      .then(json => { if (isMounted) setData(json?.data); })
      .finally(() => { if (isMounted) setLoading(false); });
    return () => { isMounted = false; };
  }, [q, page, router]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <i className="fa-duotone fa-spinner-third animate-spin text-4xl text-slate-400 opacity-30"></i>
    </div>
  );

  return (
    <div className="animate-in fade-in duration-500">
      <WatchPageLayout
        prefix="Tìm kiếm"
        title={q}
        items={data?.items || []}
        currentPage={page}
        totalPages={Math.ceil((data?.params?.pagination?.totalItems || 0) / 24)}
        totalItems={data?.params?.pagination?.totalItems || 0}
        baseUrl={`/watch/search?q=${q}`}
      />
    </div>
  );
}