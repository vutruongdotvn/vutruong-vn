-- VT Zone Watch A1. Apply to the STAGING project connected to localhost first.
-- Add one read-only RPC. No application rows, policies, registry or grants on
-- existing tables/functions are changed. Any failed assertion rolls back all.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '30s';

do $preflight$
declare
  admin_function oid := pg_catalog.to_regprocedure('private.is_app_admin()');
  expected_body text := 'selectcoalesce(auth.uid()isnotnullandexists(select1fromprivate.app_adminsawherea.user_id=auth.uid()anda.enabled),false);';
begin
  if pg_catalog.to_regprocedure('public.get_watch_access()') is not null then
    raise exception 'WATCH_A1_ALREADY_EXISTS: get_watch_access already exists. Do not overwrite it; run the verification file.';
  end if;
  if admin_function is null or pg_catalog.to_regclass('private.app_admins') is null
    or pg_catalog.to_regclass('public.profiles') is null then
    raise exception 'WATCH_A1_BASELINE_MISSING: expected hardened admin registry and profiles.';
  end if;
  if not exists (select 1 from pg_catalog.pg_proc where oid = admin_function and prosecdef
      and prorettype = 'boolean'::regtype
      and pg_catalog.regexp_replace(pg_catalog.lower(prosrc), '[[:space:]]', '', 'g') = expected_body) then
    raise exception 'WATCH_A1_ADMIN_HELPER_CHANGED: admin helper differs from the reviewed baseline. Review before proceeding.';
  end if;
  if not exists (select 1 from pg_catalog.pg_class where oid = 'public.profiles'::regclass and relrowsecurity)
    or not exists (select 1 from pg_catalog.pg_class where oid = 'private.app_admins'::regclass and relrowsecurity) then
    raise exception 'WATCH_A1_RLS_REQUIRED: RLS must be enabled on profiles and the registry.';
  end if;
  if not pg_catalog.has_schema_privilege('authenticated', 'private', 'USAGE')
    or not pg_catalog.has_function_privilege('authenticated', admin_function, 'EXECUTE')
    or not pg_catalog.has_table_privilege('authenticated', 'public.profiles', 'SELECT') then
    raise exception 'WATCH_A1_PRIVILEGES_MISSING: expected existing hardened privileges.';
  end if;
  if pg_catalog.has_table_privilege('authenticated', 'private.app_admins', 'SELECT') then
    raise exception 'WATCH_A1_REGISTRY_EXPOSED: browser roles must not read the registry table.';
  end if;
  if not exists (select 1 from private.app_admins a join auth.users u on u.id = a.user_id where a.enabled) then
    raise exception 'WATCH_A1_STAGING_ADMIN_MISSING: no enabled registry UID matches an Auth user in this project.';
  end if;
  -- Only the reviewed admin policy may authorize profile updates. Never add a
  -- self-update policy to make approval work. Reject additional write paths.
  if not exists (select 1 from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'profiles'
      and policyname = 'profiles_admin_update' and cmd = 'UPDATE' and roles = array['authenticated']::name[]
      and pg_catalog.regexp_replace(pg_catalog.lower(qual), '[[:space:]()]', '', 'g')
        in ('selectprivate.is_app_adminasis_app_admin', 'private.is_app_admin')
      and pg_catalog.regexp_replace(pg_catalog.lower(with_check), '[[:space:]()]', '', 'g')
        in ('selectprivate.is_app_adminasis_app_admin', 'private.is_app_admin'))
    or exists (select 1 from pg_catalog.pg_policies where schemaname = 'public' and tablename = 'profiles'
      and cmd in ('ALL', 'INSERT', 'UPDATE') and policyname <> 'profiles_admin_update') then
    raise exception 'WATCH_A1_PROFILE_POLICIES_CHANGED: review profiles write policies before enabling approved users.';
  end if;
end;
$preflight$;

create function public.get_watch_access()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $function$
declare
  caller_id uuid := auth.uid();
  caller_status text := 'unknown';
begin
  if caller_id is null then
    return pg_catalog.jsonb_build_object('version', 1, 'user_id', null,
      'allowed', false, 'access_kind', null, 'status', 'unknown');
  end if;

  -- Admin priority is decided before touching profiles, including missing rows.
  if private.is_app_admin() then
    return pg_catalog.jsonb_build_object('version', 1, 'user_id', caller_id,
      'allowed', true, 'access_kind', 'admin', 'status', 'approved');
  end if;

  select pg_catalog.lower(pg_catalog.btrim(p.status)) into caller_status
    from public.profiles p where p.id = caller_id;
  if caller_status is null or caller_status not in ('approved', 'pending', 'banned', 'rejected', 'revoked', 'unknown') then
    caller_status := 'unknown';
  end if;

  return pg_catalog.jsonb_build_object('version', 1, 'user_id', caller_id,
    'allowed', caller_status = 'approved',
    'access_kind', case when caller_status = 'approved' then 'approved_user' else null end,
    'status', caller_status);
end;
$function$;

revoke all on function public.get_watch_access() from public, anon, authenticated;
grant execute on function public.get_watch_access() to authenticated;
comment on function public.get_watch_access() is 'VT Zone Watch A1 v1: read-only authorization, admin registry then self approved profile.';

do $assertions$
begin
  if pg_catalog.has_function_privilege('anon', 'public.get_watch_access()', 'EXECUTE')
    or not pg_catalog.has_function_privilege('authenticated', 'public.get_watch_access()', 'EXECUTE')
    or exists (select 1 from pg_catalog.pg_proc where oid = 'public.get_watch_access()'::regprocedure and prosecdef) then
    raise exception 'WATCH_A1_PRIVILEGE_ASSERTION_FAILED';
  end if;
end;
$assertions$;

notify pgrst, 'reload schema';
commit;
