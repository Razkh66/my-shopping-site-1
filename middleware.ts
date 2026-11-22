import { NextRequest, NextResponse } from "next/server";
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const [u, p] = atob((req.headers.get("authorization") || "Basic ").split(" ")[1] || "").split(":");
    if (!process.env.ADMIN_USER || u !== process.env.ADMIN_USER || p !== process.env.ADMIN_PASS)
      return new NextResponse("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="admin"' } });
  }
  const res = NextResponse.next();
  if (!req.cookies.get("sid")) res.cookies.set("sid", crypto.randomUUID(), { httpOnly: true, maxAge: 2592000, path: "/" });
  return res;
}
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
