import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function esc(v: string) {
  return String(v)
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) return new NextResponse("Missing slug", { status: 400 });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !profile) return new NextResponse("Card not found", { status: 404 });

  const fullName = profile.full_name ?? "";
  const company = profile.company ?? "";
  const title = profile.title ?? "";
  const email = profile.email ?? "";
  const phone = profile.phone ?? "";
  const websiteRaw = profile.website ?? "";
  const website =
    websiteRaw && !websiteRaw.startsWith("http") ? `https://${websiteRaw}` : websiteRaw;

  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(fullName)}`,
    // If you don't split first/last names yet, this is acceptable:
    `N:${esc(fullName)};;;;`,
    company ? `ORG:${esc(company)}` : "",
    title ? `TITLE:${esc(title)}` : "",
    phone ? `TEL;TYPE=CELL:${esc(phone)}` : "",
    email ? `EMAIL;TYPE=INTERNET:${esc(email)}` : "",
    website ? `URL:${esc(website)}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  return new NextResponse(vcf, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.vcf"`,
      "Cache-Control": "no-store",
    },
  });
}
