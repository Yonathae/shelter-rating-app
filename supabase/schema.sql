-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Shelters table
create table public.shelters (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text not null,
  lat         double precision not null,
  lng         double precision not null,
  added_by    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- Ratings table (one per user per shelter)
create table public.ratings (
  id          uuid primary key default uuid_generate_v4(),
  shelter_id  uuid not null references public.shelters(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  friendly    smallint not null check (friendly between 1 and 5),
  safe        smallint not null check (safe between 1 and 5),
  clean       smallint not null check (clean between 1 and 5),
  happy       smallint not null check (happy between 1 and 5),
  note        text,
  created_at  timestamptz not null default now(),
  unique (shelter_id, user_id)
);

-- RPC: shelters with aggregated ratings
create or replace function public.shelters_with_ratings()
returns table (
  id           uuid,
  name         text,
  address      text,
  lat          double precision,
  lng          double precision,
  added_by     uuid,
  created_at   timestamptz,
  avg_friendly numeric,
  avg_safe     numeric,
  avg_clean    numeric,
  avg_happy    numeric,
  rating_count bigint
)
language sql stable
as $$
  select
    s.id, s.name, s.address, s.lat, s.lng, s.added_by, s.created_at,
    round(avg(r.friendly), 1) as avg_friendly,
    round(avg(r.safe), 1)     as avg_safe,
    round(avg(r.clean), 1)    as avg_clean,
    round(avg(r.happy), 1)    as avg_happy,
    count(r.id)               as rating_count
  from public.shelters s
  left join public.ratings r on r.shelter_id = s.id
  group by s.id
  order by s.created_at desc;
$$;

-- Row Level Security

alter table public.shelters enable row level security;
alter table public.ratings enable row level security;

-- Shelters: anyone can read, authenticated users can insert, owners can delete
create policy "Anyone can read shelters"
  on public.shelters for select using (true);

create policy "Authenticated users can add shelters"
  on public.shelters for insert
  with check (auth.uid() = added_by);

create policy "Owner can delete their shelter"
  on public.shelters for delete
  using (auth.uid() = added_by);

-- Ratings: anyone can read, users manage their own
create policy "Anyone can read ratings"
  on public.ratings for select using (true);

create policy "Users can insert their own rating"
  on public.ratings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rating"
  on public.ratings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own rating"
  on public.ratings for delete
  using (auth.uid() = user_id);
