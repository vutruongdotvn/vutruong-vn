import { NextResponse } from "next/server";

export async function GET() {
  try {
    const version = "v7.2.0";
    const faUrl = `https://kit-pro.fontawesome.com/releases/${version}/css/pro.min.css`;

    const res = await fetch(faUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      cache: "force-cache",
    });

    if (!res.ok) {
      return new NextResponse("Failed to load Font Awesome CSS", {
        status: 500,
      });
    }

    let css = await res.text();

    // Rewrite font path về server của bạn
    css = css.replaceAll(
      "../webfonts/",
      "/api/fa-font/"
    );

    return new NextResponse(css, {
      status: 200,
      headers: {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}