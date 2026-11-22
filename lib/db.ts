import { createClient } from "@supabase/supabase-js";
// Server-only client. All reads/writes go through server code; RLS blocks direct public access.
export const db = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
export const mvr = (n: number) => `MVR ${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
