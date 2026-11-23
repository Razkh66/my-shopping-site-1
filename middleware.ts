import { NextRequest, NextResponse } from "next/server";
function creds(h: string | null) {
  try {
    const raw = atob((h || "").split(" ")[1] || ""); const i = raw.indexOf(":");
    return i < 0 ? ["", ""] : [raw.slice(0, i), raw.slice(i + 1)]; // password may contain ":"
  } catch { return ["", ""]; }
}
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const [u, p] = creds(req.headers.get("authorization"));
    const U = process.env.ADMIN_USER?.trim(), P = process.env.ADMIN_PASS?.trim();
    if (!U || !P || u !== U || p !== P)
      return new NextResponse("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="admin"' } });
  }
  const res = NextResponse.next();
  if (!req.cookies.get("sid")) res.cookies.set("sid", crypto.randomUUID(), { httpOnly: true, maxAge: 2592000, path: "/" });
  return res;
}
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
