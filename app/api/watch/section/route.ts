import { NextRequest, NextResponse } from "next/server";
import { getSectionMovies } from "@/lib/watch/ophim";

export async function GET(request: NextRequest) {
  try {
    const api = request.nextUrl.searchParams.get("api");

    if (!api) {
      return NextResponse.json(
        { movies: [], error: "Missing api param" },
        { status: 400 }
      );
    }

    const movies = await getSectionMovies(api);

    // Sửa đoạn return NextResponse.json thành:
    return NextResponse.json(
      { movies: Array.isArray(movies) ? movies : [] },
      {
        headers: {
          // Cho phép Cache 1 giờ (3600s), phục vụ bản cũ trong 1 ngày nếu quá tải
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[/api/watch/section] error:", error);

    return NextResponse.json(
      { movies: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}