import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMovieImage } from "@/lib/watch/ophim";
import { getMovieCached } from "@/lib/watch/getMovieCached";
import ClientWatchDetail from "@/components/watch/[slug]/ClientWatchDetail";

type WatchDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ server?: string; ep?: string }>;
};

// Hàm loại bỏ thẻ HTML (Giữ nguyên của bạn)
function stripHtml(input?: string) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncateText(text: string, max = 160) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

// 🌟 SERVER-SIDE: Chỉ dùng để tạo thẻ chia sẻ Link (Open Graph)
export async function generateMetadata({
  params,
}: WatchDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    // API này đã được cache, Vercel sẽ không bị trừ usage liên tục
    const data = await getMovieCached(slug);
    const movie = data?.movie;

    if (!movie) return { title: "Không tìm thấy phim" };

    const title = movie.name;
    const description = truncateText(stripHtml(movie.content) || "", 160);
    const thumb = getMovieImage(movie.thumb_url, data.cdn);
    const url = `/watch/${slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        images: [{ url: thumb, width: 600, height: 900, alt: title }],
      },
    };
  } catch {
    return { title: "VT Watch", description: "Xem phim nội bộ" };
  }
}

// 🌟 SERVER COMPONENT: Không load UI ở đây, nhường hết cho Client
export default async function WatchDetailPage({
  params,
  searchParams,
}: WatchDetailPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};

  // Truyền params xuống cho Client tự xử lý
  return <ClientWatchDetail slug={slug} query={query} />;
}