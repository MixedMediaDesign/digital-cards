import { supabase } from "@/lib/supabase";
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  MessageCircle,
  Linkedin,
  Instagram,
  Facebook,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";

/* ---------------- Types ---------------- */

type LinkRow = {
  id: string;
  label: string;
  url: string;
  sort_order: number | null;
};

type Profile = {
  full_name: string | null;
  title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  location: string | null;
  bio: string | null;
  logo_url: string | null;
  theme: string | null;
  theme_color: string | null;
  avatar_url: string | null;
  links: LinkRow[] | null;
};

/* ---------------- Helpers ---------------- */

function safeHex(hex: string | null, fallback = "#111827") {
  const v = (hex ?? "").trim();
  return /^#[0-9A-Fa-f]{6}$/.test(v) ? v : fallback;
}

function normalizeWebsite(url: string | null) {
  if (!url) return null;
  const v = url.trim();
  return v.startsWith("http") ? v : `https://${v}`;
}

function mapsHref(location: string | null) {
  if (!location) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;
}

function iconForUrl(url: string) {
  const u = url.toLowerCase();
  if (u.includes("wa.me") || u.includes("whatsapp")) return MessageCircle;
  if (u.includes("linkedin.com")) return Linkedin;
  if (u.includes("instagram.com")) return Instagram;
  if (u.includes("facebook.com")) return Facebook;
  return LinkIcon;
}

/* ---------------- Row component ---------------- */

function RowLink({
  href,
  icon: Icon,
  title,
  subtitle,
  variant,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string | null;
  variant: "light" | "dark" | "full";
}) {
  const box =
    variant === "full"
      ? "bg-white/10 border border-white/15 hover:bg-white/15"
      : "bg-white border hover:bg-gray-50";

  const iconWrap =
    variant === "full"
      ? "bg-white/10 border border-white/20"
      : "bg-gray-50 border";

  const titleCls =
    variant === "full" ? "text-white" : "text-gray-900";

  const subCls =
    variant === "full" ? "text-white/70" : "text-gray-500";

  const iconCls =
    variant === "full" ? "text-white" : "text-gray-700";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${box}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconWrap}`}
        >
          {/* ✅ force visible icon colour */}
          <Icon size={18} className={iconCls} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          {/* ✅ force visible title colour */}
          <div className={`font-semibold truncate ${titleCls}`}>{title}</div>

          {/* show subtitle for ALL themes if provided */}
          {subtitle ? (
            <div className={`text-xs truncate ${subCls}`}>{subtitle}</div>
          ) : null}
        </div>
      </div>

      <ExternalLink
        size={16}
        className={variant === "full" ? "text-white/60" : "text-gray-400"}
      />
    </a>
  );
}

/* ---------------- Page ---------------- */

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "full_name,title,company,email,phone,website,location,bio,logo_url,theme,theme_color,avatar_url,links(id,label,url,sort_order)"
    )
    .eq("slug", slug)
    .single();

  const profile = data as Profile | null;

  if (error || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border p-6 text-center bg-white">
          <h1 className="text-xl font-semibold">Card not found</h1>
          <p className="mt-2 text-sm text-gray-600">{slug}</p>
        </div>
      </main>
    );
  }

  const theme = ((profile.theme ?? "light").toLowerCase() as
    | "light"
    | "dark"
    | "full");

  const bg = safeHex(profile.theme_color, "#111827");
  const websiteHref = normalizeWebsite(profile.website);
  const locationHref = mapsHref(profile.location);

  const links = (profile.links ?? []).slice().sort(
    (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
  );

  const logoSrc = (profile.logo_url?.trim() ? profile.logo_url.trim() : "/mm.svg");

  /* ---------------- Layout ---------------- */

  return (
    <main
      className="min-h-[100dvh] flex justify-center p-6 py-6 sm:py-10"
      style={theme === "full" ? { background: bg } : undefined}
    >
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <img
          src={logoSrc}
          alt="Logo"
          className="mx-auto mb-5 h-20 w-auto object-contain"
        />

        {/* Card */}
        <div
          className={`rounded-3xl p-6 ${
            theme === "full" ? "bg-transparent" : "bg-white shadow-sm"
          }`}
        >
          <h1
            className={`text-2xl font-semibold ${
              theme === "full" ? "text-white" : "text-gray-900"
            }`}
          >
            {profile.full_name ?? "Unnamed"}
          </h1>

          {(profile.title || profile.company) && (
            <p
              className={`mt-1 ${
                theme === "full" ? "text-white/70" : "text-gray-600"
              }`}
            >
              {profile.title ?? ""}
              {profile.company ? ` • ${profile.company}` : ""}
            </p>
          )}

          {/* Save */}
          <a
            href={`/api/vcf?slug=${encodeURIComponent(slug)}`}
            className={`mt-4 block rounded-2xl px-4 py-3 font-semibold ${
              theme === "full"
                ? "bg-white/15 text-white border border-white/20 hover:bg-white/20 transition"
                : "border hover:bg-gray-50 transition"
            }`}
          >
            Save Contact
          </a>

          {/* Links */}
          <div className="mt-5 space-y-3">
            {profile.phone && (
              <RowLink
                href={`tel:${profile.phone}`}
                icon={Phone}
                title="Call me"
                subtitle={profile.phone}
                variant={theme}
              />
            )}

            {profile.email && (
              <RowLink
                href={`mailto:${profile.email}`}
                icon={Mail}
                title="Email me"
                subtitle={profile.email}
                variant={theme}
              />
            )}

            {websiteHref && (
              <RowLink
                href={websiteHref}
                icon={Globe}
                title="Visit my website"
                subtitle={profile.website}
                variant={theme}
              />
            )}

            {locationHref && (
              <RowLink
                href={locationHref}
                icon={MapPin}
                title="Find me"
                subtitle={profile.location}
                variant={theme}
              />
            )}

            {links.map((link) => {
              const Icon = iconForUrl(link.url);
              return (
                <RowLink
                  key={link.id}
                  href={link.url}
                  icon={Icon}
                  title={link.label}
                  subtitle={link.url}
                  variant={theme}
                />
              );
            })}
          </div>

          {/* QR — smaller so it fits */}
          <div
            className={`mt-4 flex flex-col items-center gap-1 ${
              theme === "full" ? "bg-white rounded-2xl p-3" : ""
            }`}
          >
            <img
              src={`/api/qr?slug=${encodeURIComponent(slug)}`}
              alt="QR"
              className="w-28 h-28 sm:w-36 sm:h-36"
            />

            {/* ✅ readable caption in both modes */}
            <p
              className={`text-[11px] ${
                theme === "full" ? "text-gray-700" : "text-gray-600"
              }`}
            >
              Scan to open this card
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
