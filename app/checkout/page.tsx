import { db, mvr } from "@/lib/db";
import { placeOrder } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Checkout({ searchParams }: { searchParams: { error?: string } }) {
  const { data: dest } = await db().from("destinations").select("*").eq("active", true).order("atoll").order("island");
  return (<form action={placeOrder} className="max-w-lg space-y-3"><h1 className="text-2xl font-bold">Checkout</h1>
    {searchParams.error && <p className="card">{searchParams.error}</p>}
    <input name="name" required placeholder="Full name" className="inp" />
    <input name="email" type="email" required placeholder="Email" className="inp" />
    <input name="phone" required placeholder="Phone" className="inp" />
    <input name="address" required placeholder="Address" className="inp" />
    <select name="dest" required className="inp"><option value="">Delivery destination</option>
      {dest?.map((x) => <option key={x.id} value={x.id}>{x.island}, {x.atoll} - {mvr(x.fee)} - about {x.days} days</option>)}</select>
    <button className="btn">Place order</button>
    <p className="text-sm">After placing your order, upload your bank transfer slip within 24 hours or the order is cancelled.</p></form>);
}
