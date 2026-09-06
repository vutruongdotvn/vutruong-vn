-- VT Zone online CV v2 — content-only upgrade.
-- Keeps the single public.cv table and stores the featured project inside the
-- existing experience JSONB array. No new table or column is created.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '120s';
select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtext('vtzone-cv-content-v2')
);

do $assert_cv_exists$
begin
  if not exists (select 1 from public.cv where id = 1) then
    raise exception 'CV content upgrade failed: row id=1 does not exist.';
  end if;
end
$assert_cv_exists$;

update public.cv
set
  headline = 'Vận hành kinh doanh • Bán hàng • Hỗ trợ kỹ thuật',
  summary = 'Có kinh nghiệm vận hành hoạt động kinh doanh, tư vấn bán hàng và hỗ trợ xử lý lỗi phần mềm trên điện thoại, máy tính. Từng làm việc tại Cửa hàng điện thoại di động Nguyễn Linh 99 và hiện trực tiếp kinh doanh, quản lý Quán ăn Gia đình Vũ Trường. Có khả năng tự học công nghệ, giao tiếp khách hàng và làm việc độc lập hoặc phối hợp cùng tập thể.',
  experience = jsonb_build_array(
    jsonb_build_object(
      'id', 'restaurant-2024',
      'period', '10/2024 – Hiện tại',
      'title', 'Kinh doanh và quản lý vận hành',
      'organization', 'Quán ăn Gia đình Vũ Trường',
      'location', 'Óc Eo, An Giang',
      'description', 'Trực tiếp tham gia kinh doanh và duy trì hoạt động hằng ngày của quán ăn gia đình.',
      'highlights', jsonb_build_array(
        'Phối hợp phục vụ khách hàng và xử lý các công việc phát sinh trong quá trình vận hành.',
        'Chủ động sắp xếp công việc để hoạt động của quán diễn ra ổn định.'
      )
    ),
    jsonb_build_object(
      'id', 'nguyen-linh-99',
      'period', '2023 – 2024',
      'title', 'Nhân viên quản lý, bán hàng và kỹ thuật',
      'organization', 'Cửa hàng điện thoại di động Nguyễn Linh 99',
      'location', 'Óc Eo, An Giang',
      'description', 'Tham gia quản lý cửa hàng, tư vấn bán hàng và hỗ trợ kỹ thuật cho khách hàng sử dụng điện thoại, máy tính.',
      'highlights', jsonb_build_array(
        'Cài đặt Windows, phần mềm máy tính và ứng dụng trên thiết bị Android, iOS.',
        'Xử lý các lỗi phần mềm cơ bản và hỗ trợ khách hàng trong quá trình sử dụng thiết bị.'
      )
    ),
    jsonb_build_object(
      'id', 'public-security-service',
      'period', '03/2021 – 03/2023',
      'title', 'Thực hiện nghĩa vụ Công an Nhân dân',
      'organization', 'Công an Nhân dân Việt Nam',
      'location', '',
      'description', 'Hoàn thành 24 tháng thực hiện nghĩa vụ Công an Nhân dân và xuất ngũ vào tháng 03/2023.',
      'highlights', jsonb_build_array(
        'Rèn luyện tính kỷ luật, tinh thần trách nhiệm và khả năng phối hợp trong tập thể.'
      )
    ),
    jsonb_build_object(
      'id', 'project-vt-zone',
      'kind', 'project',
      'period', 'Đang phát triển',
      'title', 'VT Zone — Website cá nhân',
      'organization', 'vutruong.vn',
      'location', 'Dự án cá nhân',
      'url', 'https://www.vutruong.vn',
      'description', 'Tự xây dựng và vận hành hệ sinh thái website cá nhân với sự hỗ trợ của các công cụ AI, tập trung vào trải nghiệm người dùng, quản trị nội dung và bảo vệ dữ liệu.',
      'highlights', jsonb_build_array(
        'Phát triển giao diện bằng Next.js, TypeScript và Tailwind CSS; triển khai trên Vercel.',
        'Sử dụng Supabase cho dữ liệu, xác thực và phân quyền; Cloudinary để quản lý hình ảnh.',
        'Xây dựng blog, dark mode, quản trị nội dung và CV online có thể chỉnh sửa trực tiếp.'
      )
    )
  ),
  education = jsonb_build_array(
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
  skills = jsonb_build_array(
    jsonb_build_object(
      'id', 'operations',
      'title', 'Vận hành và giao tiếp',
      'icon', 'fa-briefcase',
      'items', jsonb_build_array(
        'Vận hành hoạt động kinh doanh',
        'Tư vấn và bán hàng',
        'Hỗ trợ khách hàng',
        'Làm việc nhóm',
        'Làm việc độc lập',
        'Thuyết trình'
      )
    ),
    jsonb_build_object(
      'id', 'technical-support',
      'title', 'Công nghệ và hỗ trợ kỹ thuật',
      'icon', 'fa-screwdriver-wrench',
      'items', jsonb_build_array(
        'Cài đặt Windows và phần mềm máy tính',
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
      'title', 'Web và sản phẩm số',
      'icon', 'fa-code',
      'items', jsonb_build_array(
        'HTML, CSS và JavaScript cơ bản',
        'Next.js và Supabase ở mức dự án cá nhân',
        'Triển khai website trên Vercel',
        'Ứng dụng công cụ AI trong phát triển sản phẩm số'
      )
    )
  )
where id = 1;

do $assert_upgrade$
begin
  if not exists (
    select 1
    from public.cv
    where id = 1
      and experience @> '[{"id":"project-vt-zone","kind":"project"}]'::jsonb
  ) then
    raise exception 'CV content upgrade failed: featured project was not saved.';
  end if;
end
$assert_upgrade$;

commit;
