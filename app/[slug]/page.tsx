import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // If you have NEXT_PUBLIC_BASE_URL on Vercel, use it. Otherwise fallback to current host.
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `${request.headers.get("x-forwarded-proto") ?? "http"}://${request.headers.get("host")}`;

  const url = `${base}/${encodeURIComponent(slug)}`;

  // IMPORTANT: return a Uint8Array (or ArrayBuffer), not Buffer
  const pngBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 320,
    margin: 1,
    errorCorrectionLevel: "M",
  });

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
