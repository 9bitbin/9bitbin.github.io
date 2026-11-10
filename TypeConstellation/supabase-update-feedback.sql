-- Constellation v1.1 update: adds the feedback table.
-- Run once in pinned-v2: SQL Editor -> New query -> paste -> Run.
-- BEFORE RUNNING: replace YOUR_EMAIL@example.com (2 places) with your owner email,
-- the same one you used in supabase-setup.sql.

create table if not exists public.quiz_feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  result_id   uuid not null references public.quiz_results(id) on delete cascade,
  fit         smallint not null check (fit between 1 and 5),
  off         text[] check (off is null or (cardinality(off) <= 5 and off <@ array['type','saviors','descriptions','growth','questions']::text[])),
  self_type   text check (self_type is null or self_type ~ '^[EI][NS][TF][JP]$'),
  focus       text check (focus is null or focus in ('general','work','rel','change','motiv','create')),
  note        text check (note is null or char_length(note) <= 300)
);

create index if not exists quiz_feedback_result_idx on public.quiz_feedback (result_id);

alter table public.quiz_feedback enable row level security;

drop policy if exists "public can submit feedback" on public.quiz_feedback;
create policy "public can submit feedback"
  on public.quiz_feedback for insert
  to anon, authenticated
  with check (true);

drop policy if exists "owner can read feedback" on public.quiz_feedback;
create policy "owner can read feedback"
  on public.quiz_feedback for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL@example.com');

drop policy if exists "owner can delete feedback" on public.quiz_feedback;
create policy "owner can delete feedback"
  on public.quiz_feedback for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL@example.com');
