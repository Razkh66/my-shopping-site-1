# Bulan Culture (v1 core)
Next.js 14 + Supabase. Run `supabase/schema.sql` in the Supabase SQL editor, copy `.env.example` to `.env.local`, then `npm install && npm run dev`.
Deploy: push to GitHub, import in Vercel, add the same env vars.

Included: search and filters, products with variants and stock, 30-minute cart reservations (pg_cron every minute), guest checkout, MVR 50 delivery by destination,
order statuses (pending, slip uploaded, approved, rejected, cancelled), slip upload compressed in the browser (private bucket), 24-hour auto-cancel, admin dashboard with stats and approve/reject (HTTP basic auth).

Not yet built: admin screens to add/edit products, categories, destinations and stock (use Supabase Table Editor and upload product images to the `products` bucket, paste the public URL into `image_url`), user and role management, email notifications, order tracking lookup.
