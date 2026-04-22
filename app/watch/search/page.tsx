import { Suspense } from "react";
import ClientSearchPage from "./ClientSearchPage";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  return { title: q ? `Tìm kiếm: ${q}` : "Tìm kiếm", robots: { index: false, follow: false } };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ClientSearchPage />
    </Suspense>
  );
}