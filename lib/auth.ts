import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db } from "./db";
import { SB_URL, SB_KEY } from "./auth-keys";
export const supa = () => {
  const c = cookies();
  return createServerClient(SB_URL, SB_KEY, { cookies: {
    getAll: () => c.getAll(),
    setAll: (l) => { try { l.forEach(({ name, value, options }) => c.set(name, value, options)); } catch {} } } });
};
// Returns the signed-in staff member, or null if not signed in / no admin access.
export async function staff(roles = ["super_admin", "admin", "order_manager"]) {
  const { data: { user } } = await supa().auth.getUser();
  if (!user) return null;
  const { data: p } = await db().from("profiles").select("role,is_active").eq("id", user.id).single();
  return p?.is_active && roles.includes(p.role) ? { user, role: p.role as string } : null;
}
