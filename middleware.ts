import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { SB_URL, SB_KEY } from "@/lib/auth-keys";
export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });
  const p = req.nextUrl.pathname;
  if (p.startsWith("/admin")) {
    const sb = createServerClient(SB_URL, SB_KEY, { cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (l) => { l.forEach(({ name, value }) => req.cookies.set(name, value)); res = NextResponse.next({ request: req });
        l.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); } } });
    const { data: { user } } = await sb.auth.getUser(); // also refreshes the session cookie
    if (!user && p !== "/admin/login") return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (!req.cookies.get("sid")) res.cookies.set("sid", crypto.randomUUID(), { httpOnly: true, maxAge: 2592000, path: "/" });
  return res;
}
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
