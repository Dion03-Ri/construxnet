import { NextResponse } from "next/server";
import { rateLimit, callerKey } from "@/lib/rateLimit";
import { supabaseAdmin, cleanSupabaseUrl } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Speichert eine E-Mail in der Warteliste (Coming-Soon-Seite).
export async function POST(req: Request) {
  // Fünf Eintragungen pro Stunde. Mehr braucht niemand ehrlich.
  const limit = rateLimit(callerKey(req, "waitlist"), 5, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte später erneut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let email = "";
  try {
    const body = await req.json();
    // Deckel vor der Prüfung: eine gültige Adresse ist nie länger.
    email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Bitte eine gültige E-Mail-Adresse eingeben." }, { status: 400 });
  }

  if (!cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server-Konfiguration unvollständig." }, { status: 500 });
  }

  const { error } = await supabaseAdmin().from("waitlist").insert({ email });

  // Doppelte Eintragung ist kein Fehler für den Nutzer.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Eintrag fehlgeschlagen. Bitte später erneut versuchen." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
