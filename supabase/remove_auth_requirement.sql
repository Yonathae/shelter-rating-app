-- Allow anonymous users to insert ratings
drop policy if exists "Authenticated users can add shelters" on public.shelters;
drop policy if exists "Users can insert their own rating" on public.ratings;

create policy "Anyone can add shelters"
  on public.shelters for insert with check (true);

create policy "Anyone can insert ratings"
  on public.ratings for insert with check (true);

-- Make user_id and added_by nullable (no login required)
alter table public.ratings alter column user_id drop not null;
alter table public.shelters alter column added_by drop not null;

-- Drop one-rating-per-user constraint (no user tracking)
alter table public.ratings drop constraint if exists ratings_shelter_id_user_id_key;

-- Allow anonymous storage uploads
drop policy if exists "Authenticated users can upload shelter images" on storage.objects;
drop policy if exists "Authenticated users can update shelter images" on storage.objects;

create policy "Anyone can upload shelter images"
  on storage.objects for insert with check (bucket_id = 'shelter-images');

create policy "Anyone can update shelter images"
  on storage.objects for update using (bucket_id = 'shelter-images');
