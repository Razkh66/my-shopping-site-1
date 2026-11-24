import { db, mvr } from "@/lib/db";
import { redirect } from "next/navigation";
import { setStatus, logout } from "@/app/actions";
import { staff } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function Admin() {
  if (!(await staff())) redirect("/admin/login?error=" + encodeURIComponent("This account has no admin access"));
  const d = db();
  const { data } = await d.from("orders").select("*, order_items(name,qty)").order("created_at", { ascending: false });
  const orders = (data ?? []) as any[];
  const { count: low } = await d.from("variants").select("id", { count: "exact", head: true }).lte("stock", 3);
  const by = (s: string) => orders.filter((o) => o.status === s).length;
  const revenue = orders.filter((o) => o.status === "approved").reduce((t, o) => t + +o.total, 0);
  const slips: Record<string, string> = {};
  await Promise.all(orders.filter((o) => o.slip_path).map(async (o) => { const r = await d.storage.from("slips").createSignedUrl(o.slip_path, 600); slips[o.id] = r.data?.signedUrl ?? ""; }));
  const stats = [["Revenue (approved)", mvr(revenue)], ["Orders", orders.length], ["Pending", by("pending")], ["Slips to review", by("slip_uploaded")],
    ["Approved", by("approved")], ["Rejected", by("rejected")], ["Cancelled", by("cancelled")], ["Low stock variants", low ?? 0]];
  return (<div className="space-y-4"><div className="flex justify-between"><h1 className="text-2xl font-bold">Dashboard</h1><form action={logout}><button className="underline">Sign out</button></form></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{stats.map(([k, v]) => <div key={k as string} className="card"><div className="text-sm">{k}</div><div className="text-xl font-bold">{v}</div></div>)}</div>
    <h2 className="text-xl font-bold">Orders</h2>
    {orders.map((o) => (<div key={o.id} className="card flex flex-wrap gap-3 justify-between">
      <div><b>{o.number}</b> - {o.status} - {mvr(o.total)}<div className="text-sm">{o.name}, {o.phone}, {o.address}</div>
        <div className="text-sm">{o.order_items.map((i: any) => `${i.name} x${i.qty}`).join(", ")}</div>
        {slips[o.id] && <a href={slips[o.id]} target="_blank" className="underline text-sm">View slip</a>}</div>
      <form action={setStatus} className="flex gap-2 items-start"><input type="hidden" name="number" value={o.number} />
        <button name="status" value="approved" className="btn">Approve</button>
        <button name="status" value="rejected" className="btn">Reject</button></form></div>))}</div>);
}
