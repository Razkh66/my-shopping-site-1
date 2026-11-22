import Link from "next/link";
import { db, mvr } from "@/lib/db";
export const dynamic = "force-dynamic";
type SP = { q?: string; cat?: string; min?: string; max?: string; stock?: string; sort?: string };
export default async function Shop({ searchParams: sp }: { searchParams: SP }) {
  const d = db();
  const { data: cats } = await d.from("categories").select("id,name").order("name");
  let q = d.from("products").select("id,name,slug,image_url,variants(price,stock)").eq("published", true);
  if (sp.q) q = q.ilike("name", `%${sp.q}%`);
  if (sp.cat) q = q.eq("category_id", sp.cat);
  const { data } = await q;
  let items = (data ?? []).map((p: any) => ({ ...p, price: Math.min(...p.variants.map((v: any) => +v.price)), inStock: p.variants.some((v: any) => v.stock > 0) }));
  if (sp.stock) items = items.filter((p) => p.inStock);
  if (sp.min) items = items.filter((p) => p.price >= +sp.min!);
  if (sp.max) items = items.filter((p) => p.price <= +sp.max!);
  if (sp.sort === "high") items.sort((a, b) => b.price - a.price); else if (sp.sort === "low") items.sort((a, b) => a.price - b.price);
  return (<div className="grid md:grid-cols-[220px_1fr] gap-6">
    <form className="space-y-3 card h-fit">
      <input name="q" defaultValue={sp.q} placeholder="Search" className="inp" />
      <select name="cat" defaultValue={sp.cat ?? ""} className="inp"><option value="">All categories</option>
        {cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <div className="flex gap-2"><input name="min" defaultValue={sp.min} placeholder="Min MVR" className="inp" /><input name="max" defaultValue={sp.max} placeholder="Max MVR" className="inp" /></div>
      <select name="sort" defaultValue={sp.sort ?? ""} className="inp"><option value="">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
      <label className="flex gap-2"><input type="checkbox" name="stock" value="1" defaultChecked={!!sp.stock} /> In stock only</label>
      <button className="btn w-full">Apply filters</button></form>
    <div>{items.length === 0 ? <p>No products match. Try clearing filters.</p> :
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{items.map((p) => (
        <Link key={p.id} href={`/product/${p.slug}`} className="card block">
          {p.image_url && <img src={p.image_url} alt={p.name} className="w-full aspect-square object-cover rounded" />}
          <div className="font-medium mt-2">{p.name}</div><div>{mvr(p.price)}</div>
          {!p.inStock && <div className="text-sm text-tan">Out of stock</div>}</Link>))}</div>}</div></div>);
}
