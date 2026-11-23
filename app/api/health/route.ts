export const dynamic = "force-dynamic";
// Temporary check: shows only whether each env var is set (never the values). Delete after setup.
export function GET() {
  const set = (k: string) => !!process.env[k]?.trim();
  return Response.json({ ADMIN_USER: set("ADMIN_USER"), ADMIN_PASS: set("ADMIN_PASS"), NEXT_PUBLIC_SUPABASE_URL: set("NEXT_PUBLIC_SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: set("SUPABASE_SERVICE_ROLE_KEY"), BANK_DETAILS: set("BANK_DETAILS") });
}
