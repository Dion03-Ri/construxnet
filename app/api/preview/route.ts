import { NextResponse } from "next/server";
import { rateLimit, callerKey } from "@/lib/rateLimit";
import { PREVIEW_COOKIE, sha256Hex, safeNext, getBypassPassword, timingSafeEqual } from "@/lib/preview";

// Setzt nach korrekter Passworteingabe das Preview-Cookie (Team-Zugang).
export async function POST(req: Request) {
  // Zehn Versuche in zehn Minuten. Wer das Passwort kennt, braucht einen;
  // wer es durchprobiert, kommt so nicht weit.
  const limit = rateLimit(callerKey(req, "preview"), 10, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Zu viele Versuche. Bitte später erneut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  const form = await req.formData();
  // Deckel gegen aufgeblähte Eingaben; ein Passwort ist nie so lang.
  const password = String(form.get("password") ?? "").slice(0, 200);
  const next = safeNext(String(form.get("next") ?? "/"));
  // Seite, zu der bei falschem Passwort zurückgeleitet wird (Coming-Soon oder /preview).
  const from = safeNext(String(form.get("from") ?? "/preview"));

  const expected = getBypassPassword();
  const origin = new URL(req.url).origin;

  // Ohne konfiguriertes Passwort gibt es keinen Zugang — nicht einmal mit
  // leerer Eingabe. Lieber ausgesperrt als offen.
  if (!expected || !timingSafeEqual(password, expected)) {
    const back = new URL(from, origin);
    back.searchParams.set("error", "1");
    if (next && next !== "/") back.searchParams.set("next", next);
    return NextResponse.redirect(back, { status: 303 });
  }

  const token = await sha256Hex(expected);
  const res = NextResponse.redirect(new URL(next, origin), { status: 303 });
  res.cookies.set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 Tage
  });
  return res;
}
