import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Giới thiệu về Vũ Trường: thông tin cá nhân, công việc, sở thích và các kênh liên hệ.",
  alternates: {
    canonical: "/blog/about",
  },
};

type AboutInfoItem = {
  label: string;
  value: string;
  icon: string;
  visible: boolean;
  href?: string;
};

type AboutMultiValueItem = {
  label: string;
  items: string[];
  icon: string;
  visible: boolean;
};

type AboutContentItem = AboutInfoItem | AboutMultiValueItem;

type AboutDisplayItem = {
  label: string;
  values: string[];
  icon: string;
  isCollection: boolean;
  href?: string;
};

const socialLinks = [
  {
    name: "Facebook",
    username: "",
    visible: true,
    href: "/fb",
    icon: "fab fa-facebook-f",
    iconClassName: "bg-[#1877F2] text-white",
  },
  {
    name: "TikTok",
    username: "",
    visible: true,
    href: "/tiktok",
    icon: "fab fa-tiktok",
    iconClassName: "bg-slate-950 text-white",
  },
  {
    name: "Locket",
    username: "",
    visible: true,
    href: "/locket",
    icon: "fad fa-heart",
    iconClassName: "bg-amber-400 text-slate-950",
  },
  {
    name: "Threads",
    username: "",
    visible: true,
    href: "/threads",
    icon: "fab fa-threads",
    iconClassName: "bg-slate-950 text-white",
  },
  {
    name: "Instagram",
    username: "",
    visible: true,
    href: "/instagram",
    icon: "fab fa-instagram",
    iconClassName: "bg-[#E4405F] text-white",
  },
  {
    name: "X",
    username: "",
    visible: true,
    href: "/x",
    icon: "fab fa-x-twitter",
    iconClassName: "bg-slate-950 text-white",
  },
];

const personalInfo: AboutInfoItem[] = [
  {
    label: "Họ và tên",
    value: "Vũ Trường",
    icon: "fad fa-signature",
    visible: false,
  },
  {
    label: "Tên gọi khác",
    value: "Anh Bar",
    icon: "fad fa-user-tag",
    visible: true,
  },
  {
    label: "Sinh nhật",
    value: "20 tháng 8",
    icon: "fad fa-cake-candles",
    visible: true,
  },
  {
    label: "Giới tính",
    value: "Nam",
    icon: "fad fa-mars",
    visible: true,
  },
  {
    label: "Quê quán",
    value: "An Giang",
    icon: "fad fa-location-dot",
    visible: true,
  },
  {
    label: "Tình trạng hôn nhân",
    value: "Độc thân",
    icon: "fad fa-heart",
    visible: true,
  },
  {
    label: "Ngôn ngữ",
    value: "Tiếng Việt",
    icon: "fad fa-language",
    visible: true,
  },
];

const workInfo: AboutInfoItem[] = [
  {
    label: "Công việc hiện tại",
    value: "Kinh doanh & lao động tự do",
    icon: "fad fa-laptop-code",
    visible: true,
  },
  {
    label: "Nơi làm việc",
    value: "An Giang",
    icon: "fad fa-building",
    visible: true,
  },
  {
    label: "Vai trò",
    value: "",
    icon: "fad fa-id-badge",
    visible: true,
  },
  {
    label: "Lĩnh vực hoạt động",
    value: "",
    icon: "fad fa-layer-group",
    visible: true,
  },
];

const hobbyGroups: AboutMultiValueItem[] = [
  {
    label: "Sở thích",
    icon: "fad fa-hearts",
    visible: true,
    items: ["Đạp xe", "Đi dạo", "Nghe nhạc", "Xem phim", "Chơi Guitar"],
  },
  {
    label: "Ăn & Uống",
    icon: "fad fa-utensils",
    visible: true,
    items: [
      "Cà phê sữa đá",
      "Cơm tấm",
      "Phở bò",
      "Hủ tiếu Nam Vang",
      "Mì cay",
      "Bún đậu",
      "Mì Ý",
    ],
  },
  {
    label: "Vận động",
    icon: "fad fa-person-running",
    visible: true,
    items: ["Chạy bộ", "Đạp xe", "Leo núi"],
  },
  {
    label: "Sáng tạo",
    icon: "fad fa-wand-magic-sparkles",
    visible: true,
    items: ["Chụp ảnh", "Quay video", "Ca hát"],
  },
];

const entertainmentInfo: AboutMultiValueItem[] = [
  {
    label: "Trò chơi yêu thích",
    items: ["PUBG Battlegrounds", "Đột Kích", "Liên Quân Mobile"],
    icon: "fad fa-gamepad",
    visible: true,
  },
  {
    label: "Tên / ID trong game",
    items: [],
    icon: "fad fa-user-ninja",
    visible: true,
  },
  {
    label: "Phim & chương trình",
    items: [],
    icon: "fad fa-clapperboard-play",
    visible: true,
  },
  {
    label: "Phim yêu thích",
    items: ["Tình cảm", "Gia đình", "Hài hước", "Linh dị"],
    icon: "fad fa-film",
    visible: true,
  },
  {
    label: "Âm nhạc",
    items: ["Ballad", "Rap", "RnB", "Bolero"],
    icon: "fad fa-music",
    visible: true,
  },
  {
    label: "Nghệ sĩ yêu thích",
    items: ["Sơn Tùng M-TP", "Quốc Thiên", "Noo Phước Thịnh", "Hồ Quang Hiếu", "Lâm Chấn Khang"],
    icon: "fad fa-microphone-stand",
    visible: true,
  },
];

const contactInfo: AboutInfoItem[] = [
  {
    label: "Số điện thoại",
    value: "",
    href: "",
    icon: "fad fa-phone",
    visible: true,
  },
  {
    label: "Email",
    value: "contact@vutruong.vn",
    href: "",
    icon: "fad fa-envelope",
    visible: true,
  },
  {
    label: "Thời gian phản hồi",
    value: "Cả ngày",
    icon: "fad fa-clock",
    visible: true,
  },
  {
    label: "Kênh liên hệ ưu tiên",
    value: "Email",
    icon: "fad fa-comment-dots",
    visible: true,
  },
];

const tabItems = [
  {
    id: "intro",
    label: "Tiểu sử",
    icon: "fad fa-sparkles",
    visible: true,
  },
  {
    id: "social",
    label: "Mạng xã hội",
    icon: "fad fa-share-nodes",
    visible: true,
  },
  {
    id: "personal",
    label: "Thông tin cá nhân",
    icon: "fad fa-address-card",
    visible: true,
  },
  {
    id: "contact",
    label: "Thông tin liên hệ",
    icon: "fad fa-address-book",
    visible: true,
  },
  {
    id: "work",
    label: "Công việc",
    icon: "fad fa-briefcase",
    visible: false,
  },
  {
    id: "hobbies",
    label: "Sở thích",
    icon: "fad fa-heart",
    visible: true,
  },
  {
    id: "entertainment",
    label: "Giải trí",
    icon: "fad fa-gamepad",
    visible: true,
  },
];

const contentPanels: { id: string; items: AboutContentItem[] }[] = [
  { id: "personal", items: personalInfo },
  { id: "contact", items: contactInfo },
  { id: "work", items: workInfo },
  { id: "hobbies", items: hobbyGroups },
  { id: "entertainment", items: entertainmentInfo },
];

const hasText = (value: string) => value.trim().length > 0;

const getVisibleContentItems = (
  items: AboutContentItem[],
): AboutDisplayItem[] =>
  items
    .filter((item) => item.visible)
    .map((item) => {
      if ("items" in item) {
        return {
          label: item.label,
          values: item.items.filter(hasText),
          icon: item.icon,
          isCollection: true,
        };
      }

      return {
        label: item.label,
        values: [item.value].filter(hasText),
        icon: item.icon,
        isCollection: false,
        href: item.href,
      };
    })
    .filter((item) => item.values.length > 0);

const itemRowClassName =
  "flex min-w-0 items-start gap-3 border-b border-slate-100 py-3 last:border-b-0 sm:gap-4 sm:py-3.5";
const itemIconClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center text-xl text-slate-500 sm:h-11 sm:w-11 sm:text-[22px]";
const itemLabelClassName = "text-xs leading-5 text-slate-500";
const itemValueClassName = "text-sm font-semibold leading-5";

const panelClassName =
  "about-tab-panel mb-3 rounded-lg border border-black/10 p-4 lg:mb-0 lg:rounded-none lg:border-0 lg:p-0";

const aboutTabsCss = [
  ".about-tab-input { display: none; }",
  ".about-tab-panel { display: block; }",
  "",
  "@keyframes about-panel-enter {",
  "  from { opacity: 0; }",
  "  to { opacity: 1; }",
  "}",
  "",
  "@media (min-width: 1024px) {",
  "  .about-tab-input {",
  "    position: absolute;",
  "    display: block;",
  "    width: 1px;",
  "    height: 1px;",
  "    padding: 0;",
  "    margin: -1px;",
  "    overflow: hidden;",
  "    clip: rect(0, 0, 0, 0);",
  "    clip-path: inset(50%);",
  "    white-space: nowrap;",
  "    border: 0;",
  "  }",
  "",
  "  .about-tab-panel { display: none; }",
  "",
  "  #about-tab-intro:checked ~ .about-tabs-layout [data-about-panel='intro'],",
  "  #about-tab-social:checked ~ .about-tabs-layout [data-about-panel='social'],",
  "  #about-tab-personal:checked ~ .about-tabs-layout [data-about-panel='personal'],",
  "  #about-tab-work:checked ~ .about-tabs-layout [data-about-panel='work'],",
  "  #about-tab-hobbies:checked ~ .about-tabs-layout [data-about-panel='hobbies'],",
  "  #about-tab-entertainment:checked ~ .about-tabs-layout [data-about-panel='entertainment'],",
  "  #about-tab-contact:checked ~ .about-tabs-layout [data-about-panel='contact'] {",
  "    display: block;",
  "    animation: about-panel-enter 500ms ease-out both;",
  "  }",
  "",
  "  #about-tab-intro:checked ~ .about-tabs-layout [data-about-tab='intro'],",
  "  #about-tab-social:checked ~ .about-tabs-layout [data-about-tab='social'],",
  "  #about-tab-personal:checked ~ .about-tabs-layout [data-about-tab='personal'],",
  "  #about-tab-work:checked ~ .about-tabs-layout [data-about-tab='work'],",
  "  #about-tab-hobbies:checked ~ .about-tabs-layout [data-about-tab='hobbies'],",
  "  #about-tab-entertainment:checked ~ .about-tabs-layout [data-about-tab='entertainment'],",
  "  #about-tab-contact:checked ~ .about-tabs-layout [data-about-tab='contact'] {",
  "    background-color: rgb(239 246 255);",
  "    color: rgb(37 99 235);",
  "  }",
  "",
  "  #about-tab-intro:focus-visible ~ .about-tabs-layout [data-about-tab='intro'],",
  "  #about-tab-social:focus-visible ~ .about-tabs-layout [data-about-tab='social'],",
  "  #about-tab-personal:focus-visible ~ .about-tabs-layout [data-about-tab='personal'],",
  "  #about-tab-work:focus-visible ~ .about-tabs-layout [data-about-tab='work'],",
  "  #about-tab-hobbies:focus-visible ~ .about-tabs-layout [data-about-tab='hobbies'],",
  "  #about-tab-entertainment:focus-visible ~ .about-tabs-layout [data-about-tab='entertainment'],",
  "  #about-tab-contact:focus-visible ~ .about-tabs-layout [data-about-tab='contact'] {",
  "    outline: 2px solid rgb(59 130 246);",
  "    outline-offset: 2px;",
  "  }",
  "}",
  "",
  "@media (min-width: 1024px) and (prefers-reduced-motion: reduce) {",
  "  .about-tab-panel { animation: none !important; }",
  "}",
].join("\n");

export default function BlogAboutPage() {
  const visibleSocialLinks = socialLinks.filter(
    (link) => link.visible && hasText(link.name) && hasText(link.href),
  );
  const visibleContentItemsByPanelId = new Map(
    contentPanels.map(
      (panel) =>
        [panel.id, getVisibleContentItems(panel.items)] as const,
    ),
  );

  const sectionHasContent = (sectionId: string) => {
    if (sectionId === "intro") return true;
    if (sectionId === "social") return visibleSocialLinks.length > 0;

    return (visibleContentItemsByPanelId.get(sectionId)?.length ?? 0) > 0;
  };

  const visibleTabItems = tabItems.filter(
    (tab) => tab.visible && sectionHasContent(tab.id),
  );
  const visibleSectionIds = new Set(visibleTabItems.map((tab) => tab.id));

  const renderMobileSectionHeader = (tabId: string) => {
    const tab = tabItems.find((item) => item.id === tabId);

    if (!tab) return null;

    return (
      <div className="mb-1 flex items-center gap-3 border-b border-slate-200 pb-3 lg:hidden uppercase">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center text-lg text-slate-500">
          <i className={tab.icon} aria-hidden="true" />
        </span>
        <h2 className="text-base font-semibold text-slate-900">{tab.label}</h2>
      </div>
    );
  };

  const renderContentPanel = (panel: (typeof contentPanels)[number]) => {
    const visibleItems = visibleContentItemsByPanelId.get(panel.id) ?? [];
    const tab = tabItems.find((item) => item.id === panel.id);

    if (!visibleSectionIds.has(panel.id)) return null;

    return (
      <section
        key={panel.id}
        id={"about-panel-" + panel.id}
        data-about-panel={panel.id}
        aria-label={tab?.label ?? panel.id}
        className={panelClassName}
      >
        {renderMobileSectionHeader(panel.id)}

        <ul className="max-w-3xl" role="list">
          {visibleItems.map((item) => (
            <li key={item.label} className={itemRowClassName}>
              <span className={itemIconClassName}>
                <i className={item.icon} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p className={itemLabelClassName}>{item.label}</p>

                {item.href ? (
                  <a
                    href={item.href}
                    className={
                      itemValueClassName +
                      " inline-flex max-w-full items-center gap-1.5 break-all text-blue-600 hover:underline"
                    }
                  >
                    {item.values[0]}
                    <i
                      className="fad fa-arrow-up-right-from-square shrink-0 text-[10px]"
                      aria-hidden="true"
                    />
                  </a>
                ) : item.isCollection ? (
                  <div className="flex flex-wrap items-baseline">
                    {item.values.map((value, index) => (
                      <span
                        key={item.label + "-" + value + "-" + index}
                        className="inline-flex min-w-0 items-baseline"
                      >
                        {index > 0 && (
                          <span className="mx-2 text-slate-400">•</span>
                        )}
                        <span
                          className={
                            itemValueClassName +
                            " cursor-pointer break-words text-slate-900 transition-colors hover:text-sky-700"
                          }
                        >
                          {value}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p
                    className={
                      itemValueClassName + " break-words text-slate-900"
                    }
                  >
                    {item.values[0]}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <PremiumGlassCard
      className="w-full max-w-6xl px-0 sm:px-4"
      contentClassName="overflow-hidden p-0"
    >
      <article className="overflow-hidden bg-white">
        <style>{aboutTabsCss}</style>

        <div className="min-w-0">
          {visibleTabItems.map((tab, index) => (
            <input
              key={tab.id}
              id={"about-tab-" + tab.id}
              type="radio"
              name="about-tab"
              defaultChecked={index === 0}
              aria-controls={"about-panel-" + tab.id}
              className="about-tab-input"
            />
          ))}

          <div className="about-tabs-layout lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
            <aside className="hidden min-w-0 border-r border-slate-200 bg-white lg:block">
              <nav
                aria-label="Các mục giới thiệu"
                className="max-h-[calc(100vh-7rem)] space-y-1 overflow-y-auto p-4"
              >
                {visibleTabItems.map((tab) => (
                  <label
                    key={tab.id}
                    htmlFor={"about-tab-" + tab.id}
                    data-about-tab={tab.id}
                    className="flex w-full cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    <i
                      className={tab.icon + " w-5 shrink-0 text-center text-sm"}
                      aria-hidden="true"
                    />
                    <span>{tab.label}</span>
                  </label>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 bg-white p-4 lg:min-h-[38rem]">
              {visibleSectionIds.has("intro") && (
                <section
                  id="about-panel-intro"
                  data-about-panel="intro"
                  aria-label="Lời giới thiệu"
                  className={panelClassName}
                >
                  {renderMobileSectionHeader("intro")}

                  <div className="max-w-3xl space-y-4 text-sm leading-7 text-slate-800 sm:text-[15px] sm:leading-7 lg:text-base lg:leading-8">
                    <p className="text-slate-950">
                      <strong>
                        Chào mừng bạn đến với Hệ sinh thái số cá nhân của mình.
                      </strong>
                      <br />
                      VT Zone là dự án cá nhân - xây dựng những thứ mình thích và chủ yếu
                      phục vụ cho nhu cầu cá nhân của mình.
                    </p>
                    <p>
                      Đam mê xây dựng những sản phẩm công nghệ tinh tế, tối ưu và mang lại
                      giá trị thực tế.
                      <br />
                      Yêu thích sự hoàn hảo trong UX/UI và luôn tìm tòi những công nghệ mới
                      nhất.
                    </p>
                    <p>
                      Dự án nhằm mục đích cá nhân, phục vụ cho nhu cầu cá nhân, hoàn toàn
                      phi lợi nhuận.
                    </p>
                  </div>
                </section>
              )}

              {visibleSectionIds.has("social") && (
                <section
                  id="about-panel-social"
                  data-about-panel="social"
                  aria-label="Liên kết xã hội"
                  className={panelClassName}
                >
                  {renderMobileSectionHeader("social")}

                  <ul
                    className="max-w-4xl lg:grid lg:grid-cols-1 lg:gap-x-6"
                    role="list"
                  >
                    {visibleSocialLinks.map((link) => (
                      <li
                        key={link.name}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={
                            hasText(link.username)
                              ? link.name + ": " + link.username
                              : link.name
                          }
                          className="group -mx-2 flex min-w-0 items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 sm:py-3.5"
                        >
                          <span
                            className={
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base " +
                              link.iconClassName
                            }
                          >
                            <i className={link.icon} aria-hidden="true" />
                          </span>

                          <span className="min-w-0 flex-1">
                            {hasText(link.username) && (
                              <span
                                className={
                                  itemLabelClassName +
                                  " block truncate transition-colors group-hover:text-blue-500"
                                }
                              >
                                {link.username}
                              </span>
                            )}
                            <span
                              className={
                                itemValueClassName +
                                " block truncate text-slate-900 transition-colors group-hover:text-blue-600"
                              }
                            >
                              {link.name}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {contentPanels.map(renderContentPanel)}
            </div>
          </div>
        </div>
      </article>
    </PremiumGlassCard>
  );
}
