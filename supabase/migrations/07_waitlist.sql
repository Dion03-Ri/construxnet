-- ============================================================
-- 07 · Warteliste (Coming-Soon-Seite)
-- Speichert E-Mail-Adressen von Interessenten vor dem Launch.
-- Schreibzugriff erfolgt server-seitig mit Service-Role
-- (RLS bleibt an, keine öffentlichen Policies → Tabelle privat).
-- ============================================================

create table if not exists waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_email_key
  on waitlist (lower(email));

alter table waitlist enable row level security;
