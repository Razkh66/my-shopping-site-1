import { notFound } from "next/navigation";
import { db, mvr } from "@/lib/db";
import { addToCart } from "@/app/actions";
export const dynamic = "force-dynamic";
export default async function Product({ params }: { params: { slug: string } }) {
  const { data: p } = await db().from("products").select("*, variants(id,label,price,stock)").eq("slug", params.slug).eq("published", true).single();
  if (!p) notFound();
  return (<div className="grid md:grid-cols-2 gap-6">
    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full rounded" />}
    <div className="space-y-3"><h1 className="text-2xl font-bold">{p.name}</h1><p>{p.description}</p>
      <form action={addToCart} className="space-y-3">
        <select name="variant" className="inp">{p.variants.map((v: any) => (
          <option key={v.id} value={v.id} disabled={v.stock < 1}>{v.label} - {mvr(v.price)} {v.stock < 1 ? "(out of stock)" : `(${v.stock} left)`}</option>))}</select>
        <input name="qty" type="number" min={1} defaultValue={1} className="inp" />
        <button className="btn">Add to cart</button>
        <p className="text-sm">Items are reserved for 30 minutes after you add them.</p></form></div></div>);
}
