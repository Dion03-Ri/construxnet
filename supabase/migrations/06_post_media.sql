-- ============================================================
-- 06 · Storage-Bucket für Bilder in Netzwerk-Beiträgen
-- Öffentlich lesbar; Upload für eingeloggte Firmen.
-- Ohne diesen Bucket wird ein Beitrag einfach ohne Bild gepostet
-- (der Composer fängt den Fehler ab).
-- ============================================================

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

-- Öffentliches Lesen der Bilder.
drop policy if exists "post-media public read" on storage.objects;
create policy "post-media public read"
  on storage.objects for select
  using (bucket_id = 'post-media');

-- Upload/Update/Delete für authentifizierte Nutzer im eigenen Bucket.
drop policy if exists "post-media write" on storage.objects;
create policy "post-media write"
  on storage.objects for insert
  with check (bucket_id = 'post-media');

drop policy if exists "post-media update" on storage.objects;
create policy "post-media update"
  on storage.objects for update
  using (bucket_id = 'post-media');
