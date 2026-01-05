import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new NextResponse("Missing slug", { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? new URL(request.url).origin;

  const targetUrl = `${origin}/${encodeURIComponent(slug)}`;

  // SVG avoids Buffer / ArrayBuffer typing issues on Vercel builds
  const svg = await QRCode.toString(targetUrl, { type: "svg", margin: 1 });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
