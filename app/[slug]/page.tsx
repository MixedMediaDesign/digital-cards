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

  // themes
  theme: string | null; // "light" | "dark" | "full"
  theme_color: string | null; // hex like #0B2D4D

  // optional photo
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
  const base =
    "w-full flex items-center justify-between rounded-2xl px-4 py-3 transition";
  const left = "flex items-center gap-3 min-w-0";
  const textWrap = "min-w-0";
  const titleCls = "font-semibold truncate";
  const subCls =
    variant === "full"
      ? "text-xs text-white/70 truncate"
      : "text-xs text-gray-500 truncate";

  const boxCls =
    variant === "full"
      ? "bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md"
      : "bg-white hover:bg-gray-50 border";

  const iconWrap =
    variant === "full"
      ? "h-10 w-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center"
      : "h-10 w-10 rounded-xl bg-gray-50 border flex items-center justify-center";

  const iconCls = variant === "full" ? "text-white" : "text-gray-700";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${boxCls}`}
    >
      <div className={left}>
        <div className={iconWrap}>
          <Icon className={iconCls} size={18} strokeWidth={2} />
        </div>

        <div className={textWrap}>
          <div className={titleCls}>{title}</div>
          {subtitle ? <div className={subCls}>{subtitle}</div> : null}
        </div>
      </div>

      <ExternalLink
        size={16}
        className={variant === "full" ? "text-white/70" : "text-gray-400"}
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
          <p className="mt-2 text-sm text-gray-600">
            No profile exists for: <span className="font-mono">{slug}</span>
          </p>
        </div>
      </main>
    );
  }

  const theme = (profile.theme ?? "light").toLowerCase() as
    | "light"
    | "dark"
    | "full";

  const bg = safeHex(profile.theme_color, "#111827");
  const websiteHref = normalizeWebsite(profile.website);
  const locationHref = mapsHref(profile.location);

  const links: LinkRow[] = (profile.links ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  const logoSrc = profile.logo_url?.trim() ? profile.logo_url.trim() : "/mm.svg";

  // Page background styling per theme
  const pageStyle =
    theme === "light"
      ? {}
      : {
          background: bg,
        };

  const outerText =
    theme === "full"
      ? "text-white"
      : theme === "dark"
      ? "text-white"
      : "text-gray-900";

  // Main card container
  const cardShell =
    theme === "full"
      ? "bg-transparent border-0 shadow-none"
      : theme === "dark"
      ? "bg-white border-0 shadow-sm"
      : "bg-white border shadow-sm";

  // QR on white panel in full theme
  const qrWrap =
    theme === "full"
      ? "mt-6 flex flex-col items-center gap-2 rounded-2xl bg-white p-4"
      : "mt-8 flex flex-col items-center gap-2";

  return (
    <main
      className={`min-h-screen flex items-center justify-center p-6 ${outerText}`}
      style={pageStyle}
    >
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="mb-6 flex justify-center">
          <img
            src={logoSrc}
            alt={`${profile.company ?? "Company"} logo`}
            className="h-20 w-auto max-w-full object-contain"
            loading="eager"
          />
        </div>

        {/* optional avatar */}
        {theme === "full" && profile.avatar_url?.trim() ? (
          <div className="mb-5 flex justify-center">
            <img
              src={profile.avatar_url.trim()}
              alt={profile.full_name ?? "Profile photo"}
              className="h-28 w-28 rounded-full object-cover border border-white/20"
            />
          </div>
        ) : null}

        <div className={`w-full rounded-3xl p-6 ${cardShell}`}>
          {/* Name + title */}
          <div className={theme === "full" ? "text-center" : ""}>
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
          </div>

          {/* Save contact */}
          <div className="mt-5">
            <a
              href={`/api/vcf?slug=${encodeURIComponent(slug)}`}
              className={
                theme === "full"
                  ? "block w-full rounded-2xl bg-white/15 border border-white/20 px-4 py-3 text-center font-semibold text-white hover:bg-white/20 transition backdrop-blur-md"
                  : "block w-full rounded-2xl border px-4 py-3 text-center font-semibold hover:bg-gray-50 transition"
              }
            >
              Save Contact
            </a>
          </div>

          {/* Icon rows */}
          <div className="mt-5 space-y-3">
            {profile.phone ? (
              <RowLink
                href={`tel:${profile.phone}`}
                icon={Phone}
                title="Call me"
                subtitle={profile.phone}
                variant={theme === "light" ? "light" : theme}
              />
            ) : null}

            {profile.email ? (
              <RowLink
                href={`mailto:${profile.email}`}
                icon={Mail}
                title="Email me"
                subtitle={profile.email}
                variant={theme === "light" ? "light" : theme}
              />
            ) : null}

            {websiteHref ? (
              <RowLink
                href={websiteHref}
                icon={Globe}
                title="Visit my website"
                subtitle={profile.website}
                variant={theme === "light" ? "light" : theme}
              />
            ) : null}

            {locationHref ? (
              <RowLink
                href={locationHref}
                icon={MapPin}
                title="Find me"
                subtitle={profile.location}
                variant={theme === "light" ? "light" : theme}
              />
            ) : null}

            {/* Custom links */}
            {links.map((link) => {
              const Icon = iconForUrl(link.url);
              return (
                <RowLink
                  key={link.id}
                  href={link.url}
                  icon={Icon}
                  title={link.label}
                  subtitle={link.url}
                  variant={theme === "light" ? "light" : theme}
                />
              );
            })}
          </div>

          {/* Bio */}
          {profile.bio ? (
            <p
              className={`mt-6 text-sm ${
                theme === "full" ? "text-white/80" : "text-gray-700"
              }`}
            >
              {profile.bio}
            </p>
          ) : null}

          {/* QR */}
          <div className={qrWrap}>
            <img
              src={`/api/qr?slug=${encodeURIComponent(slug)}`}
              alt={`QR code for ${slug}`}
              className="w-32 h-32"
            />
            <p
              className={`text-xs ${
                theme === "full" ? "text-gray-600" : "text-gray-500"
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

