-- Update the RPC to include overall_score
create or replace function public.shelters_with_ratings()
returns table (
  id            uuid,
  name          text,
  address       text,
  lat           double precision,
  lng           double precision,
  added_by      uuid,
  created_at    timestamptz,
  image_url     text,
  avg_friendly  numeric,
  avg_safe      numeric,
  avg_clean     numeric,
  avg_happy     numeric,
  overall_score numeric,
  rating_count  bigint
)
language sql stable
as $$
  select
    s.id, s.name, s.address, s.lat, s.lng, s.added_by, s.created_at, s.image_url,
    round(avg(r.friendly), 1)                                                   as avg_friendly,
    round(avg(r.safe), 1)                                                       as avg_safe,
    round(avg(r.clean), 1)                                                      as avg_clean,
    round(avg(r.happy), 1)                                                      as avg_happy,
    round((avg(r.friendly) + avg(r.safe) + avg(r.clean) + avg(r.happy)) / 4, 1) as overall_score,
    count(r.id)                                                                 as rating_count
  from public.shelters s
  left join public.ratings r on r.shelter_id = s.id
  group by s.id
  order by overall_score desc nulls last, s.created_at desc;
$$;
