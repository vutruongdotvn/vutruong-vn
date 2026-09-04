-- VT Zone security hardening — stage 1
-- Backward-compatible core RLS and privilege hardening.
-- This migration performs no INSERT/UPDATE/DELETE against application data.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '120s';
select pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('vtzone-security-phase1'));

-- Abort before changing anything if this is not the captured six-table baseline.
do $guard$
declare
  required_table_count integer;
  enabled_rls_count integer;
  baseline_policy_count integer;
begin
  select count(*)
    into required_table_count
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and c.relname in (
      'featured_stories',
      'featured_story_images',
      'posts',
      'profiles',
      'secrets',
      'user_avatars'
    );

  if required_table_count <> 6 then
    raise exception 'Security migration aborted: expected 6 application tables, found %.', required_table_count;
  end if;

  select count(*)
    into enabled_rls_count
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'featured_stories',
      'featured_story_images',
      'posts',
      'profiles',
      'secrets',
      'user_avatars'
    )
    and c.relrowsecurity;

  if enabled_rls_count <> 6 then
    raise exception 'Security migration aborted: RLS is not enabled on all 6 application tables.';
  end if;

  select count(*)
    into baseline_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in (
      'featured_stories',
      'featured_story_images',
      'posts',
      'profiles',
      'secrets',
      'user_avatars'
    );

  if baseline_policy_count <> 30 then
    raise exception 'Security migration aborted: expected 30 baseline policies, found %.', baseline_policy_count;
  end if;
end
$guard$;

-- Non-exposed administrator registry. Client roles receive no table access.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.app_admins (
  user_id uuid primary key,
  enabled boolean not null default true,
  label text,
  created_at timestamptz not null default pg_catalog.now()
);

alter table private.app_admins enable row level security;
revoke all privileges on table private.app_admins from public, anon, authenticated;

insert into private.app_admins (user_id, enabled, label)
values (
  '785f79e8-223a-41ea-a52d-dead8e2bf383'::uuid,
  true,
  'Primary production administrator'
)
on conflict (user_id) do update
set enabled = excluded.enabled,
    label = excluded.label;

create or replace function private.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce(
    auth.uid() is not null
    and exists (
      select 1
      from private.app_admins a
      where a.user_id = auth.uid()
        and a.enabled
    ),
    false
  );
$function$;

revoke all on function private.is_app_admin() from public, anon;
grant usage on schema private to authenticated, service_role;
grant execute on function private.is_app_admin() to authenticated, service_role;

-- Keep the old helper name compatible while removing profile-controlled authorization.
create or replace function public.is_featured_approved_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select private.is_app_admin();
$function$;

revoke all on function public.is_featured_approved_admin() from public, anon;
grant execute on function public.is_featured_approved_admin() to authenticated, service_role;

-- Harden Auth profile creation. Role and status are database-controlled constants.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, email, name, role, status)
  values (
    new.id,
    new.email,
    nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
    'user',
    'pending'
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

-- Create the auth trigger only when no trigger already invokes this function.
do $trigger_guard$
begin
  if not exists (
    select 1
    from pg_catalog.pg_trigger t
    join pg_catalog.pg_class c on c.oid = t.tgrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    join pg_catalog.pg_proc p on p.oid = t.tgfoid
    join pg_catalog.pg_namespace pn on pn.oid = p.pronamespace
    where not t.tgisinternal
      and n.nspname = 'auth'
      and c.relname = 'users'
      and pn.nspname = 'public'
      and p.proname = 'handle_new_user'
  ) then
    execute $ddl$
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute function public.handle_new_user()
    $ddl$;
  end if;
end
$trigger_guard$;

-- Trigger functions do not need to be directly executable by browser roles.
create or replace function public.set_featured_story_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$function$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$function$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$function$;

revoke all on function public.set_featured_story_updated_at() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.update_updated_at_column() from public, anon, authenticated;
revoke all on function public.rls_auto_enable() from public, anon, authenticated;

-- Prevent future public-schema objects from receiving broad browser privileges.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;

-- Remove current broad grants, including TRUNCATE/REFERENCES/TRIGGER.
revoke all privileges on table public.featured_stories from anon, authenticated;
revoke all privileges on table public.featured_story_images from anon, authenticated;
revoke all privileges on table public.posts from anon, authenticated;
revoke all privileges on table public.profiles from anon, authenticated;
revoke all privileges on table public.secrets from anon, authenticated;
revoke all privileges on table public.user_avatars from anon, authenticated;

-- Minimum table-level privileges. RLS supplies the final row-level decision.
grant select on table public.featured_stories to anon, authenticated;
grant insert, update, delete on table public.featured_stories to authenticated;

grant select on table public.featured_story_images to anon, authenticated;
grant insert, update, delete on table public.featured_story_images to authenticated;

grant select on table public.posts to anon, authenticated;
grant insert, update, delete on table public.posts to authenticated;

grant select, update on table public.profiles to authenticated;
grant select on table public.profiles to anon;

grant select, insert, update, delete on table public.secrets to authenticated;
grant select, insert, update, delete on table public.user_avatars to authenticated;

-- Replace all captured permissive/overlapping policies with the target matrix.
do $drop_policies$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename in (
        'featured_stories',
        'featured_story_images',
        'posts',
        'profiles',
        'secrets',
        'user_avatars'
      )
  loop
    execute pg_catalog.format(
      'drop policy %I on %I.%I',
      p.policyname,
      p.schemaname,
      p.tablename
    );
  end loop;
end
$drop_policies$;

-- POSTS: everyone reads public rows; only the registered admin can read private
-- rows or perform mutations.
create policy posts_public_select
on public.posts for select
to anon, authenticated
using (visibility = 'public');

create policy posts_admin_select
on public.posts for select
to authenticated
using ((select private.is_app_admin()));

create policy posts_admin_insert
on public.posts for insert
to authenticated
with check (
  (select private.is_app_admin())
  and user_id = (select auth.uid())
);

create policy posts_admin_update
on public.posts for update
to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

create policy posts_admin_delete
on public.posts for delete
to authenticated
using ((select private.is_app_admin()));

-- PROFILES: guests see only the public administrator profile; an authenticated
-- user can read only their own profile; the administrator can read/update all.
create policy profiles_public_admin_select
on public.profiles for select
to anon, authenticated
using (id = '785f79e8-223a-41ea-a52d-dead8e2bf383'::uuid);

create policy profiles_self_select
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_admin_select
on public.profiles for select
to authenticated
using ((select private.is_app_admin()));

create policy profiles_admin_update
on public.profiles for update
to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

-- FEATURED CONTENT: public read; administrator-only mutations.
create policy featured_stories_public_select
on public.featured_stories for select
to anon, authenticated
using (true);

create policy featured_stories_admin_insert
on public.featured_stories for insert
to authenticated
with check (
  (select private.is_app_admin())
  and created_by = (select auth.uid())
);

create policy featured_stories_admin_update
on public.featured_stories for update
to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

create policy featured_stories_admin_delete
on public.featured_stories for delete
to authenticated
using ((select private.is_app_admin()));

create policy featured_story_images_public_select
on public.featured_story_images for select
to anon, authenticated
using (true);

create policy featured_story_images_admin_insert
on public.featured_story_images for insert
to authenticated
with check ((select private.is_app_admin()));

create policy featured_story_images_admin_update
on public.featured_story_images for update
to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

create policy featured_story_images_admin_delete
on public.featured_story_images for delete
to authenticated
using ((select private.is_app_admin()));

-- SECRETS: no anonymous privilege and no non-admin row access.
create policy secrets_admin_select
on public.secrets for select
to authenticated
using ((select private.is_app_admin()));

create policy secrets_admin_insert
on public.secrets for insert
to authenticated
with check ((select private.is_app_admin()));

create policy secrets_admin_update
on public.secrets for update
to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

create policy secrets_admin_delete
on public.secrets for delete
to authenticated
using ((select private.is_app_admin()));

-- AVATAR HISTORY: temporarily administrator-only while normal users are locked.
create policy user_avatars_admin_select
on public.user_avatars for select
to authenticated
using ((select private.is_app_admin()));

create policy user_avatars_admin_insert
on public.user_avatars for insert
to authenticated
with check (
  (select private.is_app_admin())
  and user_id = (select auth.uid())
);

create policy user_avatars_admin_update
on public.user_avatars for update
to authenticated
using ((select private.is_app_admin()))
with check ((select private.is_app_admin()));

create policy user_avatars_admin_delete
on public.user_avatars for delete
to authenticated
using ((select private.is_app_admin()));

-- RLS remains enabled on every application table.
alter table public.featured_stories enable row level security;
alter table public.featured_story_images enable row level security;
alter table public.posts enable row level security;
alter table public.profiles enable row level security;
alter table public.secrets enable row level security;
alter table public.user_avatars enable row level security;

-- Structural assertions: failure rolls the entire migration back.
do $assertions$
declare
  final_policy_count integer;
  dangerous_grant_count integer;
  anonymous_secret_privilege_count integer;
begin
  select count(*)
    into final_policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename in (
      'featured_stories',
      'featured_story_images',
      'posts',
      'profiles',
      'secrets',
      'user_avatars'
    );

  if final_policy_count <> 25 then
    raise exception 'Security migration assertion failed: expected 25 target policies, found %.', final_policy_count;
  end if;

  select count(*)
    into dangerous_grant_count
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name in (
      'featured_stories',
      'featured_story_images',
      'posts',
      'profiles',
      'secrets',
      'user_avatars'
    )
    and grantee in ('anon', 'authenticated')
    and privilege_type in ('TRUNCATE', 'REFERENCES', 'TRIGGER');

  if dangerous_grant_count <> 0 then
    raise exception 'Security migration assertion failed: % dangerous client-role grants remain.', dangerous_grant_count;
  end if;

  select count(*)
    into anonymous_secret_privilege_count
  from information_schema.role_table_grants
  where table_schema = 'public'
    and table_name = 'secrets'
    and grantee = 'anon';

  if anonymous_secret_privilege_count <> 0 then
    raise exception 'Security migration assertion failed: anon still has privileges on secrets.';
  end if;
end
$assertions$;

commit;
