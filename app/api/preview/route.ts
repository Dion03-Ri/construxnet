import { NextResponse } from "next/server";
import { PREVIEW_COOKIE, sha256Hex, safeNext } from "@/lib/preview";

// Setzt nach korrekter Passworteingabe das Preview-Cookie (Team-Zugang).
export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");
  const next = safeNext(String(form.get("next") ?? "/"));

  const expected = process.env.PREVIEW_PASSWORD;
  const origin = new URL(req.url).origin;

  if (!expected || password !== expected) {
    const back = new URL("/preview", origin);
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
