-- Run this file in the Supabase SQL Editor before connecting the storefront.
-- Create the first Auth user in Supabase, then add their UUID to store_admins.

create table if not exists public.store_settings (
    id smallint primary key check (id = 1),
    settings jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
);

insert into public.store_settings (id, settings)
values (
    1,
    '{
        "brandName": "Khadija Rose House",
        "heroTitle": "الورد الذي لا يذبل",
        "heroDescription": "بوكيهات ساتان مصنوعة يدوياً لتبقى ذكرى جميلة في كل مناسبة.",
        "heroImage": "https://images.pexels.com/photos/9430356/pexels-photo-9430356.jpeg?auto=compress&cs=tinysrgb&w=1200",
        "story": "نصمم كل باقة يدوياً بحب، ونختار ألوانها وتفاصيلها لتناسب أجمل لحظاتك.",
        "location": "صنع بحب في تارودانت",
        "instagram": "",
        "whatsappPhone": "",
        "storeOpen": true,
        "prices": {
            "basePrice": 150,
            "extraPrice": 12,
            "card": 15,
            "box": 25,
            "led": 20
        },
        "products": [
            {"id":"p1","name":"همسة ورد","color":"وردي","size":"صغير","price":120,"description":"لمسة وردية ناعمة للمناسبات الصغيرة.","image":"https://images.pexels.com/photos/8879818/pexels-photo-8879818.jpeg?auto=compress&cs=tinysrgb&w=800","visible":true},
            {"id":"p2","name":"شغف أحمر","color":"أحمر","size":"متوسط","price":190,"description":"باقة دافئة تعبّر عن مشاعر كبيرة.","image":"https://images.pexels.com/photos/34730769/pexels-photo-34730769.jpeg?auto=compress&cs=tinysrgb&w=800","visible":true},
            {"id":"p3","name":"نقاء","color":"أبيض","size":"متوسط","price":175,"description":"ورود بيضاء بتفاصيل هادئة وأنيقة.","image":"https://images.pexels.com/photos/36230878/pexels-photo-36230878.jpeg?auto=compress&cs=tinysrgb&w=800","visible":true},
            {"id":"p4","name":"حديقة الأحلام","color":"متعدد","size":"كبير","price":290,"description":"تناغم ألوان يصنع لحظة لا تُنسى.","image":"https://images.pexels.com/photos/32223896/pexels-photo-32223896.jpeg?auto=compress&cs=tinysrgb&w=800","visible":true},
            {"id":"p5","name":"علبة المحبة","color":"أحمر","size":"كبير","price":320,"description":"ترتيب فاخر مستوحى من هدايا القلب.","image":"https://images.pexels.com/photos/28973772/pexels-photo-28973772.jpeg?auto=compress&cs=tinysrgb&w=800","visible":true},
            {"id":"p6","name":"صباح وردي","color":"وردي","size":"متوسط","price":165,"description":"بهجة رقيقة لبداية يوم مختلف.","image":"https://images.pexels.com/photos/36117537/pexels-photo-36117537.jpeg?auto=compress&cs=tinysrgb&w=800","visible":true}
        ],
        "colors": [
            {"name":"وردي","hex":"#e87a90","image":"https://images.pexels.com/photos/8879818/pexels-photo-8879818.jpeg?auto=compress&cs=tinysrgb&w=500","active":true},
            {"name":"أحمر","hex":"#b83b54","image":"https://images.pexels.com/photos/34730769/pexels-photo-34730769.jpeg?auto=compress&cs=tinysrgb&w=500","active":true},
            {"name":"أبيض","hex":"#f2e8df","image":"https://images.pexels.com/photos/36230878/pexels-photo-36230878.jpeg?auto=compress&cs=tinysrgb&w=500","active":true},
            {"name":"متعدد","hex":"#c278a2","image":"https://images.pexels.com/photos/32223896/pexels-photo-32223896.jpeg?auto=compress&cs=tinysrgb&w=500","active":true}
        ],
        "papers": [
            {"name":"ورق تغليف 1","image":"assets/options/papers/paper-01.avif","active":true},
            {"name":"ورق تغليف 2","image":"assets/options/papers/paper-02.avif","active":true},
            {"name":"ورق تغليف 3","image":"assets/options/papers/paper-03.avif","active":true},
            {"name":"ورق تغليف 4","image":"assets/options/papers/paper-04.avif","active":true},
            {"name":"ورق تغليف 5","image":"assets/options/papers/paper-05.avif","active":true},
            {"name":"ورق تغليف 6","image":"assets/options/papers/paper-06.avif","active":true},
            {"name":"ورق تغليف 7","image":"assets/options/papers/paper-07.avif","active":true},
            {"name":"ورق تغليف 8","image":"assets/options/papers/paper-08.avif","active":true},
            {"name":"ورق تغليف 9","image":"assets/options/papers/paper-09.avif","active":true},
            {"name":"ورق تغليف 10","image":"assets/options/papers/paper-10.avif","active":true},
            {"name":"ورق تغليف 11","image":"assets/options/papers/paper-11.avif","active":true},
            {"name":"ورق تغليف 12","image":"assets/options/papers/paper-12.avif","active":true},
            {"name":"ورق تغليف 13","image":"assets/options/papers/paper-13.avif","active":true},
            {"name":"ورق تغليف 14","image":"assets/options/papers/paper-14.avif","active":true},
            {"name":"ورق تغليف 15","image":"assets/options/papers/paper-15.avif","active":true},
            {"name":"ورق تغليف 16","image":"assets/options/papers/paper-16.avif","active":true},
            {"name":"ورق تغليف 17","image":"assets/options/papers/paper-17.avif","active":true},
            {"name":"ورق تغليف 18","image":"assets/options/papers/paper-18.avif","active":true},
            {"name":"ورق تغليف 19","image":"assets/options/papers/paper-19.avif","active":true}
        ],
        "ribbons": [
            {"name":"شريط ستان 1","image":"assets/options/ribbons/ribbon-01.jpeg","active":true},
            {"name":"شريط ستان 2","image":"assets/options/ribbons/ribbon-02.jpeg","active":true},
            {"name":"شريط ستان 3","image":"assets/options/ribbons/ribbon-03.jpeg","active":true},
            {"name":"شريط ستان 4","image":"assets/options/ribbons/ribbon-04.jpeg","active":true},
            {"name":"شريط ستان 5","image":"assets/options/ribbons/ribbon-05.jpeg","active":true},
            {"name":"شريط ستان 6","image":"assets/options/ribbons/ribbon-06.jpeg","active":true},
            {"name":"شريط ستان 7","image":"assets/options/ribbons/ribbon-07.jpeg","active":true},
            {"name":"شريط ستان 8","image":"assets/options/ribbons/ribbon-08.jpeg","active":true},
            {"name":"شريط ستان 9","image":"assets/options/ribbons/ribbon-09.jpeg","active":true}
        ],
        "addonImages": {
            "card":"https://images.pexels.com/photos/1666065/pexels-photo-1666065.jpeg?auto=compress&cs=tinysrgb&w=500",
            "box":"https://images.pexels.com/photos/264985/pexels-photo-264985.jpeg?auto=compress&cs=tinysrgb&w=500",
            "led":"https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=500"
        }
    }'::jsonb
)
on conflict (id) do update
set settings = jsonb_set(
    excluded.settings || public.store_settings.settings,
    '{prices}',
    excluded.settings->'prices' || coalesce(public.store_settings.settings->'prices', '{}'::jsonb)
);

create table if not exists public.store_admins (
    user_id uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);

create table if not exists public.orders (
    id text primary key check (length(id) between 8 and 80),
    created_at timestamptz not null default now(),
    customer jsonb not null,
    details jsonb not null,
    total numeric(10, 2) not null default 0 check (total >= 0),
    status text not null default 'new' check (status in ('new', 'sent', 'cancelled')),
    whatsapp_sent boolean not null default false,
    constraint valid_customer_fields check (
        length(trim(coalesce(customer->>'name', ''))) between 1 and 120
        and length(trim(coalesce(customer->>'phone', ''))) between 5 and 40
        and length(trim(coalesce(customer->>'city', ''))) between 1 and 120
        and length(trim(coalesce(customer->>'address', ''))) between 1 and 300
        and length(coalesce(customer->>'note', '')) <= 1000
    )
);

update public.orders
set details = jsonb_set(
    details,
    '{items}',
    jsonb_build_array(jsonb_build_object(
        'kind', 'legacy',
        'qty', 1,
        'name', coalesce(details->>'productName', 'طلب سابق'),
        'details', 'تم الاحتفاظ بالطلب السابق أثناء تحديث المتجر'
    )),
    true
)
where details->'items' is null
   or details->'items' = 'null'::jsonb;

alter table public.orders drop constraint if exists valid_bouquet_details;
alter table public.orders drop constraint if exists valid_order_items;
alter table public.orders
    add constraint valid_order_items check (
        case
            when jsonb_typeof(details->'items') = 'array'
                then jsonb_array_length(details->'items') between 1 and 50
            else false
        end
    ) not valid;

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.store_admins
        where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

create or replace function public.set_order_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    price_config jsonb;
    product_config jsonb;
    line_item jsonb;
    custom_design jsonb;
    rose_count integer;
    quantity integer;
    addon_names jsonb;
    computed_total numeric(10, 2);
begin
    select coalesce(settings->'prices', '{}'::jsonb)
    into price_config
    from public.store_settings
    where id = 1;

    computed_total := 0;
    if jsonb_typeof(new.details->'items') is distinct from 'array' then
        raise exception 'An order must contain at least one item';
    end if;
    if jsonb_array_length(new.details->'items') not between 1 and 50 then
        raise exception 'An order must contain between 1 and 50 items';
    end if;

    for line_item in select value from jsonb_array_elements(new.details->'items')
    loop
        quantity := (line_item->>'qty')::integer;
        if quantity not between 1 and 99 then
            raise exception 'Invalid item quantity';
        end if;

        if line_item->>'kind' = 'product' then
            select product.value
            into product_config
            from jsonb_array_elements(coalesce(
                (select settings->'products' from public.store_settings where id = 1),
                '[]'::jsonb
            )) as product(value)
            where product.value->>'id' = line_item->>'productId'
              and coalesce((product.value->>'visible')::boolean, false);
            if product_config is null then
                raise exception 'A product is unavailable';
            end if;
            computed_total := computed_total + (product_config->>'price')::numeric * quantity;
        elsif line_item->>'kind' = 'custom' then
            custom_design := line_item->'custom';
            rose_count := (custom_design->>'count')::integer;
            if rose_count not between 5 and 50 then
                raise exception 'Invalid custom bouquet size';
            end if;
            if not exists (
                select 1 from jsonb_array_elements(coalesce(
                    (select settings->'colors' from public.store_settings where id = 1),
                    '[]'::jsonb
                )) as option(value)
                where option.value->>'name' = custom_design->>'color'
                  and coalesce((option.value->>'active')::boolean, false)
            ) then
                raise exception 'The selected rose color is unavailable';
            end if;
            if not exists (
                select 1 from jsonb_array_elements(coalesce(
                    (select settings->'papers' from public.store_settings where id = 1),
                    '[]'::jsonb
                )) as option(value)
                where option.value->>'name' = custom_design->>'paper'
                  and coalesce((option.value->>'active')::boolean, false)
            ) then
                raise exception 'The selected wrapping paper is unavailable';
            end if;
            if not exists (
                select 1 from jsonb_array_elements(coalesce(
                    (select settings->'ribbons' from public.store_settings where id = 1),
                    '[]'::jsonb
                )) as option(value)
                where option.value->>'name' = custom_design->>'ribbon'
                  and coalesce((option.value->>'active')::boolean, false)
            ) then
                raise exception 'The selected ribbon is unavailable';
            end if;

            addon_names := coalesce(custom_design->'addons', '[]'::jsonb);
            computed_total := computed_total + (
                greatest(0, coalesce((price_config->>'basePrice')::numeric, 150)
                    + (rose_count - 10) * coalesce((price_config->>'extraPrice')::numeric, 12))
                + case when addon_names ? 'card' then coalesce((price_config->>'card')::numeric, 15) else 0 end
                + case when addon_names ? 'box' then coalesce((price_config->>'box')::numeric, 25) else 0 end
                + case when addon_names ? 'led' then coalesce((price_config->>'led')::numeric, 20) else 0 end
            ) * quantity;
        else
            raise exception 'Invalid order item type';
        end if;
    end loop;

    new.total := computed_total;
    return new;
end;
$$;

drop trigger if exists orders_set_total on public.orders;
create trigger orders_set_total
before insert on public.orders
for each row execute function public.set_order_total();

create or replace function public.place_store_order(
    p_id text,
    p_customer jsonb,
    p_details jsonb
)
returns table (
    id text,
    created_at timestamptz,
    customer jsonb,
    details jsonb,
    total numeric,
    status text,
    whatsapp_sent boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
    if length(regexp_replace(
        coalesce((select settings->>'whatsappPhone' from public.store_settings where id = 1), ''),
        '[^0-9]',
        '',
        'g'
    )) not between 8 and 15 then
        raise exception 'The store WhatsApp number is not configured';
    end if;

    if not coalesce(
        (select (settings->>'storeOpen')::boolean from public.store_settings where id = 1),
        true
    ) then
        raise exception 'The store is currently closed';
    end if;

    return query
    insert into public.orders (id, customer, details)
    values (p_id, p_customer, p_details)
    returning
        orders.id,
        orders.created_at,
        orders.customer,
        orders.details,
        orders.total,
        orders.status,
        orders.whatsapp_sent;
end;
$$;

revoke all on function public.place_store_order(text, jsonb, jsonb) from public;
grant execute on function public.place_store_order(text, jsonb, jsonb) to anon, authenticated;

alter table public.store_settings enable row level security;
alter table public.store_admins enable row level security;
alter table public.orders enable row level security;

drop policy if exists "Public can read store settings" on public.store_settings;
create policy "Public can read store settings"
on public.store_settings for select
to anon, authenticated
using (true);

drop policy if exists "Admins can update store settings" on public.store_settings;
create policy "Admins can update store settings"
on public.store_settings for update
to authenticated
using ((select public.is_store_admin()))
with check ((select public.is_store_admin()));

drop policy if exists "Admins can read their own membership" on public.store_admins;
create policy "Admins can read their own membership"
on public.store_admins for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders for select
to authenticated
using ((select public.is_store_admin()));

drop policy if exists "Admins can update orders" on public.orders;
create policy "Admins can update orders"
on public.orders for update
to authenticated
using ((select public.is_store_admin()))
with check ((select public.is_store_admin()));

drop policy if exists "Admins can delete orders" on public.orders;
create policy "Admins can delete orders"
on public.orders for delete
to authenticated
using ((select public.is_store_admin()));

grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant select on public.store_admins to authenticated;
revoke all on public.orders from anon, authenticated;
grant select, update, delete on public.orders to authenticated;

-- After creating an admin in Authentication > Users, run:
-- insert into public.store_admins (user_id)
-- values ('PASTE-THE-AUTH-USER-UUID-HERE')
-- on conflict (user_id) do nothing;
