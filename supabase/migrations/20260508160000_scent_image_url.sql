-- Add an image_url column to scents so admins can manage scent imagery from the dashboard.

alter table public.scents
  add column if not exists image_url text;
