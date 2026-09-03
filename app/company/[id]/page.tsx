import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Heart,
  Mail,
  Phone,
  Globe,
  Truck,
  Boxes,
  Ruler,
  Gauge,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";
import { requireCompanyOrOnboard } from "@/lib/company";
import CompanyConnect from "@/components/CompanyConnect";
import { badge, CARD } from "@/lib/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  BUYER: "Bauunternehmen",
  SUPPLIER: "Baustoffwerk / Lieferant",
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
  about?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  supply_materials?: string[] | null;
  supply_regions?: string[] | null;
  delivery_radius_km?: number | null;
  capacity_note?: string | null;
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
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("companies").select("company_name").eq("id", id).maybeSingle();
  const name = (data as { company_name: string } | null)?.company_name;
  return { title: name ? `${name} · Obtanet` : "Firma · Obtanet" };
}

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireCompanyOrOnboard();
  const { id } = await params;
  const supabase = createServerSupabaseClient();

  // Volles Profil versuchen; falls Migration 04/05 fehlt, auf Basis zurückfallen.
  const full = await supabase
    .from("companies")
    .select("id, company_name, uid_number, role, canton, city, verified, logo_url, bio, about, email, phone, address, website, supply_materials, supply_regions, delivery_radius_km, capacity_note")
    .eq("id", id)
    .maybeSingle();
  const companyData = full.error
    ? (await supabase.from("companies").select("id, company_name, uid_number, role, canton, city, verified, logo_url, bio").eq("id", id).maybeSingle()).data
    : full.data;

  const company = companyData as Company | null;
  if (!company) notFound();

  const isSupplier = company.role === "SUPPLIER";
  const isMe = me.id === company.id;

  const { data: postsData } = await supabase
    .from("network_posts")
    .select("id, post_type, title, content, region, likes_count, created_at")
    .eq("company_id", id)
    .order("created_at", { ascending: false })
    .limit(20);
  const posts = (postsData ?? []) as Post[];

  const hasContact = company.email || company.phone || company.address || company.website;
  const site = company.website ? (company.website.startsWith("http") ? company.website : `https://${company.website}`) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Profil-Header */}
      <section className={cn(CARD, "overflow-hidden")}>
        <div className="h-24 bg-gradient-to-r from-navy-900 via-navy-700 to-brand" />
        <div className="px-6 pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="-mt-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-100 text-xl font-bold text-slate-700 shadow-card">
                {company.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo_url} alt={company.company_name} className="h-full w-full object-cover" />
                ) : (
                  initials(company.company_name)
                )}
              </span>
              <div className="mt-3 flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{company.company_name}</h1>
                {company.verified && <BadgeCheck className="h-5 w-5 text-accent" />}
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                {ROLE_LABEL[company.role] ?? company.role}
                {company.city ? ` · ${company.city}` : ""}
                {company.canton ? ` (${company.canton})` : ""}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> {company.uid_number}
              </p>
              {company.verified && (
                <span className={cn("mt-2", badge("accent", true))}>
                  <ShieldCheck className="h-3 w-3" /> Verifizierter Baupartner
                </span>
              )}
            </div>
            {isMe ? (
              <Link
                href="/profile/edit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-brand-500"
              >
                <Pencil className="h-4 w-4" /> Profil bearbeiten
              </Link>
            ) : (
              <CompanyConnect targetId={company.id} />
            )}
          </div>

          {(company.about || company.bio) && (
            <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {company.about || company.bio}
            </p>
          )}
        </div>
      </section>

      {/* Liefer-Profil (nur Lieferanten) */}
      {isSupplier && (
        <section className={cn(CARD, "mt-4 p-6")}>
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <Truck className="h-4 w-4 text-brand" /> Liefer-Profil
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Boxes className="h-3.5 w-3.5" /> Materialien
              </div>
              {company.supply_materials?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {company.supply_materials.map((m) => (
                    <span key={m} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-700">{m}</span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-slate-400">Noch nicht angegeben</p>
              )}
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> Liefergebiete
              </div>
              {company.supply_regions?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {company.supply_regions.map((r) => (
                    <span key={r} className="rounded-md border border-accent/25 bg-accent/5 px-2.5 py-1 text-[12px] font-medium text-accent">{r}</span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-slate-400">Noch nicht angegeben</p>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-500"><Ruler className="h-4 w-4" /></span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Lieferradius</div>
                <div className="text-sm font-semibold text-slate-900">{company.delivery_radius_km ? `${company.delivery_radius_km} km` : "—"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-500"><Gauge className="h-4 w-4" /></span>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wider text-slate-400">Kapazität</div>
                <div className="truncate text-sm font-semibold text-slate-900">{company.capacity_note || "—"}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Kontakt */}
      {hasContact && (
        <section className={cn(CARD, "mt-4 p-6")}>
          <h2 className="text-[15px] font-semibold text-slate-900">Kontakt</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-brand"><Mail className="h-4 w-4 text-slate-400" /> {company.email}</a>}
            {company.phone && <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-brand"><Phone className="h-4 w-4 text-slate-400" /> {company.phone}</a>}
            {company.address && <div className="flex items-center gap-2.5 text-sm text-slate-700"><MapPin className="h-4 w-4 text-slate-400" /> {company.address}</div>}
            {site && <a href={site} className="flex items-center gap-2.5 text-sm text-slate-700 hover:text-brand"><Globe className="h-4 w-4 text-slate-400" /> {company.website}</a>}
          </div>
        </section>
      )}

      {/* Beiträge */}
      <h2 className="mb-3 mt-8 text-lg font-bold tracking-tight text-slate-900">Beiträge</h2>
      {posts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center text-sm text-slate-400">
          Noch keine Beiträge.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.id} className={cn(CARD, "p-5")}>
              <div className="flex items-center justify-between">
                <span className={badge("gold", true)}>{POST_TYPE_LABEL[p.post_type] ?? p.post_type}</span>
                <span className="text-xs text-slate-400">
                  {new Date(p.created_at).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
              </div>
              {p.title && <h3 className="mt-2 font-semibold text-slate-900">{p.title}</h3>}
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-600">{p.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" /> {p.likes_count}</span>
                {p.region && <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {p.region}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
