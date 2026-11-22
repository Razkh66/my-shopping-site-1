-- Bulan Culture schema. Run in Supabase SQL editor.
create extension if not exists pg_cron;
create table categories(id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null);
create table products(id uuid primary key default gen_random_uuid(), category_id uuid references categories, name text not null, slug text unique not null,
  description text, image_url text, published boolean default true, created_at timestamptz default now());
create table variants(id uuid primary key default gen_random_uuid(), product_id uuid references products on delete cascade, label text not null default 'Default',
  sku text, price numeric(12,2) not null, stock int not null default 0 check (stock >= 0));
create table cart_items(id uuid primary key default gen_random_uuid(), session_id text not null, variant_id uuid references variants on delete cascade,
  qty int not null check (qty > 0), reserved_until timestamptz not null);
create table destinations(id uuid primary key default gen_random_uuid(), atoll text not null, island text not null, days int not null default 7,
  fee numeric(12,2) not null default 50, active boolean default true);
create sequence order_seq;
create table orders(id uuid primary key default gen_random_uuid(), number text unique not null,
  status text not null default 'pending' check (status in ('pending','slip_uploaded','approved','rejected','cancelled')),
  name text, email text, phone text, address text, destination_id uuid references destinations, delivery_fee numeric(12,2), total numeric(12,2),
  slip_path text, hold_expires_at timestamptz, created_at timestamptz default now());
create table order_items(id uuid primary key default gen_random_uuid(), order_id uuid references orders on delete cascade, variant_id uuid references variants,
  name text, qty int, price numeric(12,2));
-- RLS on, no public policies: the app accesses data only from the server with the service role key.
alter table categories enable row level security; alter table products enable row level security; alter table variants enable row level security;
alter table cart_items enable row level security; alter table destinations enable row level security; alter table orders enable row level security; alter table order_items enable row level security;
insert into storage.buckets(id,name,public) values ('slips','slips',false),('products','products',true) on conflict do nothing;

-- Stock is reserved by decrementing variants.stock; it is restored on expiry, rejection or cancellation.
create function release_expired() returns void language plpgsql as $$
begin
  with d as (delete from cart_items where reserved_until < now() returning variant_id, qty)
  update variants v set stock = v.stock + x.q from (select variant_id, sum(qty) q from d group by 1) x where v.id = x.variant_id;
  update variants v set stock = v.stock + x.q from (select oi.variant_id, sum(oi.qty) q from order_items oi join orders o on o.id = oi.order_id
    where o.status = 'pending' and o.hold_expires_at < now() group by 1) x where v.id = x.variant_id;
  update orders set status = 'cancelled' where status = 'pending' and hold_expires_at < now();
end $$;
create function add_to_cart(p_sid text, p_vid uuid, p_qty int) returns void language plpgsql as $$
begin
  perform release_expired();
  update variants set stock = stock - p_qty where id = p_vid and stock >= p_qty;
  if not found then raise exception 'Not enough stock available'; end if;
  insert into cart_items(session_id, variant_id, qty, reserved_until) values (p_sid, p_vid, p_qty, now() + interval '30 minutes');
end $$;
create function remove_cart_item(p_sid text, p_item uuid) returns void language plpgsql as $$
declare c cart_items;
begin
  delete from cart_items where id = p_item and session_id = p_sid returning * into c;
  if found then update variants set stock = stock + c.qty where id = c.variant_id; end if;
end $$;
create function place_order(p_sid text, p_name text, p_email text, p_phone text, p_address text, p_dest uuid) returns text language plpgsql as $$
declare d destinations; sub numeric; n text; oid uuid;
begin
  select * into d from destinations where id = p_dest and active;
  if not found then raise exception 'Choose a delivery destination'; end if;
  perform release_expired();
  select coalesce(sum(c.qty * v.price), 0) into sub from cart_items c join variants v on v.id = c.variant_id where c.session_id = p_sid;
  if sub = 0 then raise exception 'Your cart is empty or its reservations expired'; end if;
  n := 'BC-' || to_char(now(), 'YYMMDD') || '-' || lpad(nextval('order_seq')::text, 4, '0');
  insert into orders(number, name, email, phone, address, destination_id, delivery_fee, total, hold_expires_at)
    values (n, p_name, p_email, p_phone, p_address, p_dest, d.fee, sub + d.fee, now() + interval '24 hours') returning id into oid;
  insert into order_items(order_id, variant_id, name, qty, price)
    select oid, c.variant_id, p.name || ' (' || v.label || ')', c.qty, v.price from cart_items c
    join variants v on v.id = c.variant_id join products p on p.id = v.product_id where c.session_id = p_sid;
  delete from cart_items where session_id = p_sid;
  return n;
end $$;
create function slip_uploaded(p_n text, p_path text) returns void language sql as $$
  update orders set slip_path = p_path, status = 'slip_uploaded' where number = p_n and status in ('pending','rejected');
$$;
create function set_order_status(p_n text, p_s text) returns void language plpgsql as $$
declare o orders;
begin
  select * into o from orders where number = p_n for update;
  if o.status not in ('rejected','cancelled') and p_s in ('rejected','cancelled') then
    update variants v set stock = v.stock + x.q from (select variant_id, sum(qty) q from order_items where order_id = o.id group by 1) x where v.id = x.variant_id;
  end if;
  update orders set status = p_s where id = o.id;
end $$;
select cron.schedule('release-expired', '* * * * *', 'select release_expired()');

-- Starter data
insert into destinations(atoll, island, days, fee) values ('Noonu', 'Kendhikulhudhoo', 2, 50), ('Kaafu', 'Maafushi', 7, 50);
insert into categories(name, slug) values ('Handicrafts', 'handicrafts'), ('Food', 'food');
