-- Rooms directory: every room is listed, open rooms can be joined straight away,
-- locked rooms show a lock and can't be joined. Safe to run twice.
-- Run in Supabase > SQL Editor > New query.

-- Lists every room with its name, photo, lock and member count. Never returns the room code,
-- so nobody can join from the list without tapping a room that is open.
create or replace function public.list_rooms()
returns table (id uuid, name text, photo_path text, locked boolean, member_count int, is_member boolean)
language sql stable security definer set search_path = public
as $$
  select b.id, b.name, b.photo_path, coalesce(b.locked, false),
    (select count(*)::int from board_members m where m.board_id = b.id),
    exists (select 1 from board_members m where m.board_id = b.id and m.user_id = auth.uid())
  from boards b
  limit 200;
$$;

-- Joins an open room. Locked rooms and full rooms (10 people) are refused.
-- Returns the room so the app can open it straight away.
create or replace function public.join_room_by_id(p_board uuid)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  b record;
  n int;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select * into b from boards where id = p_board;
  if not found then raise exception 'No room'; end if;
  if not exists (select 1 from board_members where board_id = p_board and user_id = me) then
    if coalesce(b.locked, false) then
      raise exception 'This room is locked. Ask the people inside to unlock it.';
    end if;
    select count(*) into n from board_members where board_id = p_board;
    if n >= 10 then raise exception 'That board is full (10 people max)'; end if;
    insert into board_members (board_id, user_id, joined_at) values (p_board, me, now());
  end if;
  return (select to_json(x) from (
    select id, code, created_by, bg_mode, bg, name, photo_path, locked, listed from boards where id = p_board
  ) x);
end;
$$;

revoke all on function public.list_rooms() from public, anon;
revoke all on function public.join_room_by_id(uuid) from public, anon;
grant execute on function public.list_rooms() to authenticated;
grant execute on function public.join_room_by_id(uuid) to authenticated;

-- Owners can hide their room from the room map. Members still see it, and it can still be joined with its code.
alter table public.boards add column if not exists listed boolean not null default true;

create or replace function public.list_rooms()
returns table (id uuid, name text, photo_path text, locked boolean, member_count int, is_member boolean)
language sql stable security definer set search_path = public
as $$
  select b.id, b.name, b.photo_path, coalesce(b.locked, false),
    (select count(*)::int from board_members m where m.board_id = b.id),
    exists (select 1 from board_members m where m.board_id = b.id and m.user_id = auth.uid())
  from boards b
  where b.listed or exists (select 1 from board_members m where m.board_id = b.id and m.user_id = auth.uid())
  limit 200;
$$;

create or replace function public.set_room_listed(p_board uuid, p_listed boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from boards where id = p_board and created_by = auth.uid()) then
    raise exception 'Only the room owner can change this';
  end if;
  update boards set listed = p_listed where id = p_board;
end;
$$;

revoke all on function public.set_room_listed(uuid, boolean) from public, anon;
grant execute on function public.set_room_listed(uuid, boolean) to authenticated;

-- Joining with a code: the old join_board function stopped at 2 people. This replaces it with the
-- 10-person limit, and keeps locked rooms closed to new people.
drop function if exists public.join_board(text);
create or replace function public.join_board(p_code text)
returns json
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  clean text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  b record;
  n int;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select * into b from boards where code = clean;
  if not found then raise exception 'No board with that code'; end if;
  if not exists (select 1 from board_members where board_id = b.id and user_id = me) then
    if coalesce(b.locked, false) then
      raise exception 'This room is locked. Ask the people inside to unlock it.';
    end if;
    select count(*) into n from board_members where board_id = b.id;
    if n >= 10 then raise exception 'That board is full (10 people max)'; end if;
    insert into board_members (board_id, user_id, joined_at) values (b.id, me, now());
  end if;
  return (select to_json(x) from (
    select id, code, created_by, bg_mode, bg, name, photo_path, locked, listed from boards where id = b.id
  ) x);
end;
$$;

revoke all on function public.join_board(text) from public, anon;
grant execute on function public.join_board(text) to authenticated;

-- Anyone in the room can take admin. Admin moves to whoever presses it.
create or replace function public.take_room_admin(p_board uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from board_members where board_id = p_board and user_id = auth.uid()) then
    raise exception 'Only people in this room can take admin';
  end if;
  update boards set created_by = auth.uid() where id = p_board;
end;
$$;

revoke all on function public.take_room_admin(uuid) from public, anon;
grant execute on function public.take_room_admin(uuid) to authenticated;

-- App admin: coolhimal20@gmail.com can see and delete every room, including ones they aren't in.
create or replace function public.is_app_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'coolhimal20@gmail.com';
$$;

-- list_rooms now also returns can_delete (app admin, or the room's admin) and lists every room for the app admin.
drop function if exists public.list_rooms();
create or replace function public.list_rooms()
returns table (id uuid, name text, photo_path text, locked boolean, member_count int, is_member boolean, can_delete boolean)
language sql stable security definer set search_path = public
as $$
  select b.id, b.name, b.photo_path, coalesce(b.locked, false),
    (select count(*)::int from board_members m where m.board_id = b.id),
    exists (select 1 from board_members m where m.board_id = b.id and m.user_id = auth.uid()),
    (public.is_app_admin() or b.created_by = auth.uid())
  from boards b
  where b.listed
    or public.is_app_admin()
    or exists (select 1 from board_members m where m.board_id = b.id and m.user_id = auth.uid())
  limit 200;
$$;

-- Deleting a room: the room's admin, the app admin, or the only person in the room.
-- Storage files (photos, drawings, voice notes) are removed by the app before this runs.
create or replace function public.delete_board(b uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  me uuid := auth.uid();
  n int;
begin
  if me is null then raise exception 'Sign in first'; end if;
  select count(*) into n from board_members where board_id = b;
  if not (public.is_app_admin()
      or exists (select 1 from boards where id = b and created_by = me)
      or (n <= 1 and exists (select 1 from board_members where board_id = b and user_id = me))) then
    raise exception 'Only the room admin can delete this room';
  end if;
  delete from boards where id = b;
end;
$$;

revoke all on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;
revoke all on function public.list_rooms() from public, anon;
grant execute on function public.list_rooms() to authenticated;
revoke all on function public.delete_board(uuid) from public, anon;
grant execute on function public.delete_board(uuid) to authenticated;
