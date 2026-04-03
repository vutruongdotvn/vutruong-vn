import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;

    const allowed = /^[a-zA-Z0-9._-]+\.(woff2?|ttf|otf)$/;
    if (!allowed.test(file)) {
      return new NextResponse("Invalid file", { status: 400 });
    }

    const fontUrl = `https://kit-pro.fontawesome.com/releases/v7.2.0/webfonts/${file}`;

    const res = await fetch(fontUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "force-cache",
    });

    if (!res.ok) {
      return new NextResponse("Failed to load font", { status: 500 });
    }

    const buffer = await res.arrayBuffer();

    const contentType =
      file.endsWith(".woff2")
        ? "font/woff2"
        : file.endsWith(".woff")
        ? "font/woff"
        : file.endsWith(".ttf")
        ? "font/ttf"
        : "application/octet-stream";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}