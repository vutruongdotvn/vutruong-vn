-- VT Zone online CV — single-row, single-table module.
-- Public visitors can read the published record. Only the administrator UUID
-- registered in private.app_admins can update it.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '120s';
select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtext('vtzone-create-cv-v1')
);

create table public.cv (
  id smallint primary key default 1 check (id = 1),
  full_name text not null check (char_length(full_name) between 1 and 160),
  nickname text not null default '' check (char_length(nickname) <= 120),
  headline text not null default '' check (char_length(headline) <= 240),
  summary text not null default '' check (char_length(summary) <= 2000),
  location text not null default '' check (char_length(location) <= 160),
  email text not null default '' check (char_length(email) <= 254),
  website text not null default '' check (char_length(website) <= 300),
  avatar_url text check (
    avatar_url is null or char_length(avatar_url) <= 1000
  ),
  experience jsonb not null default '[]'::jsonb
    check (jsonb_typeof(experience) = 'array'),
  education jsonb not null default '[]'::jsonb
    check (jsonb_typeof(education) = 'array'),
  skills jsonb not null default '[]'::jsonb
    check (jsonb_typeof(skills) = 'array'),
  interests text[] not null default '{}'::text[],
  is_published boolean not null default true,
  updated_at timestamptz not null default pg_catalog.now()
);

comment on table public.cv is
  'Singleton public CV record for vutruong.vn/cv. Sensitive private identity data is intentionally excluded.';

alter table public.cv enable row level security;

revoke all privileges on table public.cv from public, anon, authenticated;
grant select on table public.cv to anon, authenticated;
grant update on table public.cv to authenticated;

create policy cv_public_select
on public.cv for select
to anon, authenticated
using (is_published = true);

create policy cv_admin_select
on public.cv for select
to authenticated
using ((select private.is_app_admin()));

create policy cv_admin_update
on public.cv for update
to authenticated
using ((select private.is_app_admin()))
with check (
  (select private.is_app_admin())
  and id = 1
);

create trigger cv_set_updated_at
before update on public.cv
for each row execute function public.set_updated_at();

insert into public.cv (
  id,
  full_name,
  nickname,
  headline,
  summary,
  location,
  email,
  website,
  experience,
  education,
  skills,
  interests,
  is_published
)
values (
  1,
  'Nguyễn Văn Vũ Trường',
  'Anh Bar',
  'Quản lý vận hành • Bán hàng • Hỗ trợ kỹ thuật',
  'Có kinh nghiệm trong quản lý vận hành, bán hàng, hỗ trợ kỹ thuật thiết bị và phát triển các sản phẩm số cá nhân. Chủ động học hỏi, linh hoạt xử lý vấn đề, có thể làm việc độc lập hoặc phối hợp cùng tập thể.',
  'Óc Eo, An Giang, Việt Nam',
  'contact@vutruong.vn',
  'https://www.vutruong.vn',
  jsonb_build_array(
    jsonb_build_object(
      'id', 'restaurant-2024',
      'period', '10/2024 – nay',
      'title', 'Kinh doanh và quản lý vận hành',
      'organization', 'Quán ăn Gia đình Vũ Trường',
      'location', 'Óc Eo, An Giang',
      'description', 'Tham gia kinh doanh và quản lý hoạt động của quán ăn gia đình.',
      'highlights', jsonb_build_array()
    ),
    jsonb_build_object(
      'id', 'nguyen-linh-99',
      'period', '2023 – 2024',
      'title', 'Nhân viên quản lý, bán hàng và kỹ thuật',
      'organization', 'Cửa hàng điện thoại di động Nguyễn Linh 99',
      'location', 'Óc Eo, An Giang',
      'description', 'Phụ trách công việc quản lý, bán hàng và hỗ trợ kỹ thuật tại cửa hàng điện thoại di động.',
      'highlights', jsonb_build_array(
        'Cài đặt phần mềm và xử lý các lỗi phần mềm cơ bản trên điện thoại, máy tính.',
        'Tư vấn và hỗ trợ khách hàng trong quá trình sử dụng thiết bị.'
      )
    ),
    jsonb_build_object(
      'id', 'public-security-service',
      'period', '03/2021 – 03/2023',
      'title', 'Thực hiện nghĩa vụ Công an Nhân dân',
      'organization', 'Công an Nhân dân Việt Nam',
      'location', '',
      'description', 'Hoàn thành 24 tháng thực hiện nghĩa vụ Công an Nhân dân và xuất ngũ vào tháng 3/2023.',
      'highlights', jsonb_build_array()
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', 'saigontourist-2018',
      'period', '2018 – 2020',
      'title', 'Ngành Hướng dẫn du lịch',
      'organization', 'Trường Trung cấp Du lịch & Khách sạn Saigontourist',
      'location', 'TP. Hồ Chí Minh',
      'description', 'Bảo lưu kết quả học tập do ảnh hưởng của đại dịch COVID-19.',
      'highlights', jsonb_build_array()
    ),
    jsonb_build_object(
      'id', 'high-school-2018',
      'period', '2018',
      'title', 'Tốt nghiệp Trung học phổ thông',
      'organization', '',
      'location', 'An Giang',
      'description', '',
      'highlights', jsonb_build_array()
    )
  ),
  jsonb_build_array(
    jsonb_build_object(
      'id', 'operations',
      'title', 'Vận hành và giao tiếp',
      'icon', 'fa-briefcase',
      'items', jsonb_build_array(
        'Quản lý và bán hàng',
        'Hỗ trợ khách hàng',
        'Làm việc nhóm',
        'Thuyết trình',
        'Làm việc độc lập'
      )
    ),
    jsonb_build_object(
      'id', 'technical-support',
      'title', 'Công nghệ và hỗ trợ kỹ thuật',
      'icon', 'fa-screwdriver-wrench',
      'items', jsonb_build_array(
        'Cài đặt Windows',
        'Cài đặt phần mềm và ứng dụng',
        'Hỗ trợ thiết bị Android và iOS',
        'Xử lý lỗi phần mềm cơ bản'
      )
    ),
    jsonb_build_object(
      'id', 'digital-tools',
      'title', 'Công cụ số',
      'icon', 'fa-laptop-mobile',
      'items', jsonb_build_array(
        'Microsoft Office',
        'Adobe Photoshop',
        'CapCut',
        'SketchUp'
      )
    ),
    jsonb_build_object(
      'id', 'web',
      'title', 'Web cơ bản',
      'icon', 'fa-code',
      'items', jsonb_build_array(
        'HTML',
        'CSS',
        'JavaScript',
        'Xây dựng và vận hành website cá nhân'
      )
    )
  ),
  array[
    'Guitar',
    'Piano',
    'Ca hát',
    'Du lịch',
    'Đạp xe',
    'Leo núi',
    'Quay dựng video',
    'Chỉnh sửa hình ảnh'
  ]::text[],
  true
);

do $assertions$
begin
  if (select count(*) from public.cv) <> 1 then
    raise exception 'CV migration failed: expected exactly one row.';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'cv'
      and c.relrowsecurity
  ) then
    raise exception 'CV migration failed: RLS is not enabled.';
  end if;
end
$assertions$;

commit;
