import { supabase } from "@/lib/supabase";

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

  // ✅ add this:
  logo_url: string | null;

  links: LinkRow[] | null;
};

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      // ✅ add logo_url in the select:
      "full_name,title,company,email,phone,website,location,bio,logo_url,links(id,label,url,sort_order)"
    )
    .eq("slug", slug)
    .single();

  const profile = data as Profile | null;

  if (error || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border p-6 text-center">
          <h1 className="text-xl font-semibold">Card not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            No profile exists for: <span className="font-mono">{slug}</span>
          </p>
        </div>
      </main>
    );
  }

  const websiteHref =
    profile.website && profile.website.startsWith("http")
      ? profile.website
      : profile.website
      ? `https://${profile.website}`
      : null;

  const links: LinkRow[] = profile.links ?? [];

  // ✅ decide what logo to show
  // If a client has a logo_url, use it. Otherwise use your default.
  const logoSrc = profile.logo_url?.trim() ? profile.logo_url.trim() : "/mm.svg";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* ✅ LOGO (per profile, fallback to /mm.svg) */}
        <div className="mb-8 flex justify-center">
          <img
            src={logoSrc}
            alt={`${profile.company ?? "Company"} logo`}
            className="h-10 w-auto"
            loading="eager"
          />
        </div>

        <div className="w-full rounded-2xl border p-6 shadow-sm bg-white">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">
              {profile.full_name ?? "Unnamed"}
            </h1>

            {(profile.title || profile.company) && (
              <p className="text-gray-600">
                {profile.title ?? ""}
                {profile.company ? ` • ${profile.company}` : ""}
              </p>
            )}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            {profile.email && (
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${profile.email}`} className="underline">
                  {profile.email}
                </a>
              </p>
            )}

            {profile.phone && (
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${profile.phone}`} className="underline">
                  {profile.phone}
                </a>
              </p>
            )}

            {websiteHref && (
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600"
                >
                  {profile.website}
                </a>
              </p>
            )}

            {profile.location && (
              <p>
                <strong>Location:</strong> {profile.location}
              </p>
            )}
          </div>

          {profile.bio && (
            <p className="mt-6 text-sm text-gray-700">{profile.bio}</p>
          )}

          <div className="mt-8 space-y-3">
            {links
              .slice()
              .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
              .map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50 transition"
                >
                  {link.label}
                </a>
              ))}

            <a
              href={`/api/vcf?slug=${encodeURIComponent(slug)}`}
              className="block rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50 transition"
            >
              Save Contact
            </a>
          </div>

          <div className="mt-8 flex flex-col items-center gap-2">
            <img
              src={`/api/qr?slug=${encodeURIComponent(slug)}`}
              alt={`QR code for ${slug}`}
              className="w-40 h-40"
            />
            <p className="text-xs text-gray-500">Scan to open this card</p>
          </div>
        </div>
      </div>
    </main>
  );
}
