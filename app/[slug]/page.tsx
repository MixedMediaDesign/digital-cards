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
  links: LinkRow[] | null;
};

export default async function CardPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name,title,company,email,phone,website,location,bio,links(id,label,url,sort_order)")
    .eq("slug", params.slug)
    .single();

  const profile = data as Profile | null;

  if (error || !profile) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border p-6 text-center">
          <h1 className="text-xl font-semibold">Card not found</h1>
          <p className="mt-2 text-sm text-gray-600">
            No profile exists for: <span className="font-mono">{params.slug}</span>
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

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border p-6 shadow-sm bg-white">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{profile.full_name ?? "Unnamed"}</h1>

          {(profile.title || profile.company) && (
            <p className="text-gray-600">
              {profile.title ?? ""}
              {profile.company ? ` • ${profile.company}` : ""}
            </p>
          )}
        </div>

        {/* Contact details */}
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

        {/* Bio */}
        {profile.bio && <p className="mt-6 text-sm text-gray-700">{profile.bio}</p>}

        {/* Buttons */}
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
            href={`/api/vcf?slug=${encodeURIComponent(params.slug)}`}
            className="block rounded-xl border px-4 py-3 text-center font-medium hover:bg-gray-50 transition"
          >
            Save Contact
          </a>
        </div>

        {/* QR Code */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <img
            src={`/api/qr?slug=${encodeURIComponent(params.slug)}`}
            alt={`QR code for ${params.slug}`}
            className="w-40 h-40"
          />
          <p className="text-xs text-gray-500">Scan to open this card</p>
        </div>
      </div>
    </main>
  );
}
