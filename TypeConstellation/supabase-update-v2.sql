-- Constellation v2 update: scenario quiz columns.
-- Run once in pinned-v2: SQL Editor -> New query -> paste -> Run.
-- Safe to run after supabase-setup.sql and supabase-update-feedback.sql.
-- No email to change in this file. All existing security rules stay as they are.

alter table public.quiz_results
  add column if not exists consistency    real   check (consistency is null or consistency between 0 and 1),
  add column if not exists core_default   text[] check (core_default is null or (cardinality(core_default) <= 2 and core_default <@ array['Ni','Ne','Si','Se','Ti','Te','Fi','Fe']::text[])),
  add column if not exists ideal_gap      text[] check (ideal_gap is null or (cardinality(ideal_gap) <= 8 and ideal_gap <@ array['Ni','Ne','Si','Se','Ti','Te','Fi','Fe']::text[])),
  add column if not exists stress_profile text[] check (stress_profile is null or (cardinality(stress_profile) <= 2 and stress_profile <@ array['Ni','Ne','Si','Se','Ti','Te','Fi','Fe']::text[])),
  add column if not exists context_fns    jsonb  check (context_fns is null or (jsonb_typeof(context_fns) = 'array' and jsonb_array_length(context_fns) <= 3));

-- v2 answers carry more detail per item (scenario, 6 shown options, strength, why).
-- Keep the item-count cap at 60 and raise the size guard so a full v2 take fits comfortably.
alter table public.quiz_results drop constraint if exists row_size_limit;
alter table public.quiz_results add constraint row_size_limit
  check (pg_column_size(answers) + coalesce(pg_column_size(coins),0) + coalesce(pg_column_size(type_probs),0) + coalesce(pg_column_size(context_fns),0) < 64000);
