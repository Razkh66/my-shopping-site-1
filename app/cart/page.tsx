import Link from "next/link";
import { cookies } from "next/headers";
import { db, mvr } from "@/lib/db";
import { removeItem } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Cart({ searchParams }: { searchParams: { error?: string } }) {
  const d = db(); await d.rpc("release_expired");
  const { data } = await d.from("cart_items").select("id,qty,reserved_until,variants(label,price,products(name))").eq("session_id", cookies().get("sid")?.value ?? "");
  const rows = (data ?? []) as any[]; const sub = rows.reduce((t, r) => t + r.qty * r.variants.price, 0);
  return (<div className="space-y-3"><h1 className="text-2xl font-bold">Your cart</h1>
    {searchParams.error && <p className="card">{searchParams.error}</p>}
    {rows.length === 0 && <p>Your cart is empty. Items you add stay reserved for 30 minutes.</p>}
    {rows.map((r) => (<div key={r.id} className="card flex justify-between items-center">
      <div>{r.variants.products.name} ({r.variants.label}) x {r.qty}<div className="text-sm">
        {Math.max(0, Math.ceil((+new Date(r.reserved_until) - Date.now()) / 60000))} min left (refresh to update)</div></div>
      <div className="flex gap-3 items-center">{mvr(r.qty * r.variants.price)}
        <form action={removeItem}><input type="hidden" name="id" value={r.id} /><button className="underline">Remove</button></form></div></div>))}
    {rows.length > 0 && <><div className="text-right font-bold">Subtotal {mvr(sub)}</div><Link href="/checkout" className="btn inline-block">Checkout</Link></>}</div>);
}
