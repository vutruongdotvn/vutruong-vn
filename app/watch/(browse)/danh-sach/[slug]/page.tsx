import { fetchPageData } from "@/lib/watch/fetchPage";
import ClientBrowsePage from "../../ClientBrowsePage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await fetchPageData("danh-sach", slug, 1);
  return { title: `Danh sách: ${data.title}`, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientBrowsePage type="danh-sach" slug={slug} titlePrefix="Danh sách" />;
}