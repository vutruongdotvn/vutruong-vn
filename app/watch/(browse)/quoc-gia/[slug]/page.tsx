import { fetchPageData } from "@/lib/watch/fetchPage";
import ClientBrowsePage from "../../ClientBrowsePage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await fetchPageData("quoc-gia", slug, 1);
  return { title: `Quốc gia: ${data.title}`, robots: { index: false, follow: false } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientBrowsePage type="quoc-gia" slug={slug} titlePrefix="Quốc gia" />;
}