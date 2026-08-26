import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Heart } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireCompanyOrOnboard } from "@/lib/company";
import CompanyConnect from "@/components/CompanyConnect";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk",
  ADMIN: "Admin",
};

const POST_TYPE_LABEL: Record<string, string> = {
  UPDATE: "Update",
  JOB: "Stellen",
  MATERIAL_OFFER: "Material-Angebot",
  PROJECT: "Projekt",
  ANNOUNCEMENT: "Ankündigung",
};

type Company = {
  id: string;
  company_name: string;
  uid_number: string;
  role: string;
  canton: string | null;
  city: string | null;
  verified: boolean;
  logo_url: string | null;
  bio: string | null;
};

type Post = {
  id: string;
  post_type: string;
  title: string | null;
  content: string;
  region: string | null;
  likes_count: number;
  created_at: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("companies")
    .select("company_name")
    .eq("id", id)
    .maybeSingle();
  const name = (data as { company_name: string } | null)?.company_name;
  return { title: name ? `${name} · ConstruxNet` : "Firma · ConstruxNet" };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireCompanyOrOnboard();
  const { id } = await params;

  const supabase = createServerSupabaseClient();
  const { data: companyData } = await supabase
    .from("companies")
    .select(
      "id, company_name, uid_number, role, canton, city, verified, logo_url, bio",
    )
    .eq("id", id)
    .maybeSingle();

  const company = companyData as Company | null;
  if (!company) notFound();

  const { data: postsData } = await supabase
    .from("network_posts")
    .select("id, post_type, title, content, region, likes_count, created_at")
    .eq("company_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  const posts = (postsData ?? []) as Post[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Profil-Header */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-lg font-semibold text-slate-700">
              {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo_url}
                  alt={company.company_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(company.company_name)
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {company.company_name}
                </h1>
                {company.verified && (
                  <BadgeCheck className="h-5 w-5 text-emerald" />
                )}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {ROLE_LABEL[company.role] ?? company.role}
                {company.city ? ` · ${company.city}` : ""}
                {company.canton ? ` (${company.canton})` : ""}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {company.uid_number}
              </p>
            </div>
          </div>

          <CompanyConnect targetId={company.id} />
        </div>

        {company.bio && (
          <p className="mt-5 whitespace-pre-wrap text-sm text-slate-600">
            {company.bio}
          </p>
        )}
      </section>

      {/* Beiträge */}
      <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight text-slate-900">
        Beiträge
      </h2>
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-500">
          Noch keine Beiträge.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article
              key={p.id}
              className="rounded-lg border border-slate-200 bg-white p-5 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-brand/15 px-2.5 py-0.5 text-[11px] font-medium text-brand">
                  {POST_TYPE_LABEL[p.post_type] ?? p.post_type}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(p.created_at).toLocaleDateString("de-CH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
              {p.title && (
                <h3 className="mt-2 font-semibold text-slate-900">{p.title}</h3>
              )}
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">
                {p.content}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Heart className="h-4 w-4" />
                  {p.likes_count}
                </span>
                {p.region && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.region}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
