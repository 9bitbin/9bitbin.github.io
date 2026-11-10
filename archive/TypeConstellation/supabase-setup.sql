-- Constellation quiz: Supabase setup
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- BEFORE RUNNING: replace YOUR_EMAIL@example.com (near the bottom) with the email
-- you will use for your owner login.

create table if not exists public.quiz_results (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  client_id     uuid,                                   -- random ID per browser, links repeat takes
  name          text not null check (char_length(btrim(name)) between 1 and 40),
  quiz_version  text check (char_length(quiz_version) <= 40),
  type          text not null check (type ~ '^[EI][NS][TF][JP]$'),
  subtype       text not null check (subtype ~ '^(Ni|Ne|Si|Se|Ti|Te|Fi|Fe)-(Ni|Ne|Si|Se|Ti|Te|Fi|Fe)$'),
  dom           text check (dom in ('Ni','Ne','Si','Se','Ti','Te','Fi','Fe')),
  other         text check (other in ('Ni','Ne','Si','Se','Ti','Te','Fi','Fe')),
  subtype_pos   text check (subtype_pos in ('aux','tert')),
  lead          text check (lead in ('Observer','Decider')),
  animal        text check (animal in ('Sleep','Consume','Blast','Play')),
  type_prob     real check (type_prob between 0 and 1),
  subtype_prob  real check (subtype_prob between 0 and 1),
  coins         jsonb,
  type_probs    jsonb,
  answers       jsonb not null check (jsonb_typeof(answers) = 'array' and jsonb_array_length(answers) between 1 and 60),
  -- keep rows small so nobody can stuff huge payloads in
  constraint row_size_limit check (pg_column_size(answers) + coalesce(pg_column_size(coins),0) + coalesce(pg_column_size(type_probs),0) < 32000)
);

create index if not exists quiz_results_created_at_idx on public.quiz_results (created_at desc);

-- Row Level Security: ON. Without a policy, nobody can do anything.
alter table public.quiz_results enable row level security;

-- 1) Anyone (the public quiz page) can SUBMIT a result...
drop policy if exists "public can submit results" on public.quiz_results;
create policy "public can submit results"
  on public.quiz_results for insert
  to anon, authenticated
  with check (true);

-- ...but there is NO public select/update/delete policy, so the public anon key
-- in your GitHub page cannot read anyone's results.

-- 2) Only YOU (logged in through admin.html) can READ and DELETE results.
drop policy if exists "owner can read results" on public.quiz_results;
create policy "owner can read results"
  on public.quiz_results for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL@example.com');

drop policy if exists "owner can delete results" on public.quiz_results;
create policy "owner can delete results"
  on public.quiz_results for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = 'YOUR_EMAIL@example.com');
