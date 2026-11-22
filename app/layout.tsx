import "./globals.css";
import Link from "next/link";
export const metadata = { title: "Bulan Culture", description: "Maldivian cultural products" };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body>
    <header className="bg-brown text-cream"><div className="max-w-6xl mx-auto p-4 flex gap-4 items-center flex-wrap">
      <Link href="/" className="text-xl font-bold">Bulan Culture</Link>
      <form action="/" className="flex-1 min-w-[180px]"><input name="q" placeholder="Search products" className="inp text-brown" /></form>
      <Link href="/cart">Cart</Link></div></header>
    <main className="max-w-6xl mx-auto p-4">{children}</main>
    <footer className="max-w-6xl mx-auto p-4 text-sm border-t border-tan mt-8">
      Delivery Sunday to Thursday, 9:00 to 14:00. Kendhikulhudhoo: about 2 days. Other islands: up to 1 week. Delivery fee MVR 50.</footer>
  </body></html>);
}
