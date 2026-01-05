import QRCode from "qrcode";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return new NextResponse("Missing slug", { status: 400 });
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}`;

  try {
    const qr = await QRCode.toBuffer(url, {
      width: 512,
      margin: 2,
    });

    return new NextResponse(qr, {
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (err) {
    return new NextResponse("QR generation failed", { status: 500 });
  }
}
