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

    return NextResponse.json({
      movies: Array.isArray(movies) ? movies : [],
    });
  } catch (error) {
    console.error("[/api/watch/section] error:", error);

    return NextResponse.json(
      { movies: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}