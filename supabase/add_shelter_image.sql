-- Add image_url column to shelters
alter table public.shelters add column if not exists image_url text;

-- Create a public storage bucket for shelter images
insert into storage.buckets (id, name, public)
values ('shelter-images', 'shelter-images', true)
on conflict (id) do nothing;

-- Storage policies: anyone can read, authenticated users can upload/update
create policy "Public read shelter images"
  on storage.objects for select
  using (bucket_id = 'shelter-images');

create policy "Authenticated users can upload shelter images"
  on storage.objects for insert
  with check (bucket_id = 'shelter-images' and auth.role() = 'authenticated');

create policy "Authenticated users can update shelter images"
  on storage.objects for update
  using (bucket_id = 'shelter-images' and auth.role() = 'authenticated');
