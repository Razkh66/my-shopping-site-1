import { notFound } from "next/navigation";
import { db, mvr } from "@/lib/db";
import SlipUpload from "@/components/SlipUpload";
export const dynamic = "force-dynamic";
const label: Record<string, string> = { pending: "Pending (waiting for slip)", slip_uploaded: "Slip uploaded (under review)", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled" };
export default async function Order({ params }: { params: { number: string } }) {
  const { data: o } = await db().from("orders").select("*, order_items(*), destinations(island,atoll,days)").eq("number", params.number).single();
  if (!o) notFound();
  return (<div className="space-y-3 max-w-xl"><h1 className="text-2xl font-bold">Order {o.number}</h1>
    <p className="card">Status: <b>{label[o.status]}</b></p>
    {o.order_items.map((i: any) => <div key={i.id}>{i.name} x {i.qty} - {mvr(i.qty * i.price)}</div>)}
    <div>Delivery to {o.destinations.island}, {o.destinations.atoll}: {mvr(o.delivery_fee)}</div>
    <div className="font-bold">Total {mvr(o.total)}</div>
    {["pending", "rejected"].includes(o.status) && <div className="card space-y-2">
      <p>Transfer {mvr(o.total)} to: {process.env.BANK_DETAILS}</p>
      {o.status === "pending" && <p className="text-sm">Upload your slip before {new Date(o.hold_expires_at).toLocaleString("en-GB")}.</p>}
      <SlipUpload number={o.number} /></div>}</div>);
}
