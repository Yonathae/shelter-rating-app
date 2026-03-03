-- Add sub_ratings JSONB column to ratings table
alter table public.ratings add column if not exists sub_ratings jsonb;
