import type { Metadata } from "next";
import { getMovieImage } from "@/lib/watch/ophim";
import { getMovieCached } from "@/lib/watch/getMovieCached";
import ClientWatchDetail from "./ClientWatchDetail";

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<{ server?: string; ep?: string }>; };

function stripHtml(input?: string) { return input ? input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim() : ""; }
function truncateText(text: string, max = 160) { return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await getMovieCached(slug);
    if (!data?.movie) return { title: "Không tìm thấy phim" };
    const title = data.movie.name;
    const thumb = getMovieImage(data.movie.thumb_url, data.cdn);
    return {
      title,
      description: truncateText(stripHtml(data.movie.content), 160),
      openGraph: { title, images: [{ url: thumb }] },
    };
  } catch { return { title: "VT Watch" }; }
}

export default async function WatchDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  return <ClientWatchDetail slug={slug} query={query} />;
}