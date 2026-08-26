import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import type { Metadata } from "next";
export const revalidate = 86400;

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
    username: "Liên kết đã xác thực",
    visible: true,
    href: "/fb",
    icon: "fab fa-facebook-f",
  },
  {
    name: "Instagram",
    username: "Liên kết đã xác thực",
    visible: true,
    href: "/instagram",
    icon: "fab fa-instagram",
  },
  {
    name: "Locket",
    username: "Liên kết đã xác thực",
    visible: true,
    href: "/locket",
    icon: "fad fa-heart",
  },
  {
    name: "TikTok",
    username: "Liên kết đã xác thực",
    visible: true,
    href: "/tiktok",
    icon: "fab fa-tiktok",
  },
  {
    name: "Threads",
    username: "Liên kết đã xác thực",
    visible: true,
    href: "/threads",
    icon: "fab fa-threads",
  },
  {
    name: "X",
    username: "",
    visible: false,
    href: "/x",
    icon: "fab fa-x-twitter",
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
    label: "Tình trạng",
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
    value: "Kinh doanh",
    icon: "fad fa-fork-knife",
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
    value: "Quản lý",
    icon: "fad fa-id-badge",
    visible: true,
  },
  {
    label: "Lĩnh vực hoạt động",
    value: "Dịch vụ Ăn uống, Dịch vụ Du lịch",
    icon: "fad fa-layer-group",
    visible: true,
  },
];

const hobbyGroups: AboutMultiValueItem[] = [
  {
    label: "Sở thích",
    icon: "fad fa-hearts",
    visible: true,
    items: ["Đi dạo", "Nghe nhạc", "Ca hát"],
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
    ],
  },
  {
    label: "Vận động",
    icon: "fad fa-person-running",
    visible: true,
    items: ["Chạy bộ", "Chạy xe đạp", "Leo núi"],
  },
  {
    label: "Nhạc cụ",
    icon: "fad fa-guitars",
    visible: true,
    items: ["Guitar", "Piano"],
  },
  {
    label: "Sở thích khác",
    icon: "fad fa-wand-magic-sparkles",
    visible: true,
    items: ["Chụp ảnh", "Quay video", "Viết Blog", "Code"],
  },
];

const entertainmentInfo: AboutMultiValueItem[] = [
  {
    label: "Trò chơi",
    items: ["PUBG Battlegrounds", "Cities Skylines"],
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
    label: "Phim",
    items: ["Tình cảm", "Gia đình", "Linh dị"],
    icon: "fad fa-film",
    visible: true,
  },
  {
    label: "Âm nhạc",
    items: ["Ballad", "Rap", "Bolero"],
    icon: "fad fa-music",
    visible: true,
  },
  {
    label: "Nghệ sĩ",
    items: ["Sơn Tùng M-TP", "Quốc Thiên"],
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
    icon: "fad fa-users",
    visible: true,
  },
  {
    id: "personal",
    label: "Cá nhân",
    icon: "fad fa-address-book",
    visible: true,
  },
  {
    id: "contact",
    label: "Liên hệ",
    icon: "fad fa-phone",
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
    icon: "fad fa-hearts",
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
  "flex min-w-0 items-start gap-3 border-b border-slate-100 py-2 last:border-b-0 sm:gap-4 sm:py-3.5";
const itemIconClassName =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-lg text-slate-500 lg:h-12 lg:w-12 lg:text-2xl";
const itemLabelClassName = "text-xs leading-5 text-slate-400";
const itemValueClassName = "text-sm font-medium leading-6 lg:text-base";

const panelClassName = "about-tab-panel mb-12 lg:mb-0";

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
  "    animation: about-panel-enter 500ms ease-in-out both;",
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

  const renderSectionHeader = (tabId: string) => {
    const tab = tabItems.find((item) => item.id === tabId);

    if (!tab) return null;

    return (
      <div className="mb-3 flex items-center gap-3 border-b border-slate-200 pb-3">
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
        {renderSectionHeader(panel.id)}

        <ul className="" role="list">
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
                  <div>
                    {item.values.map((value, index) => (
                      <span
                        key={item.label + "-" + value + "-" + index}
                      // className="inline-flex min-w-0 items-baseline"
                      >
                        {index > 0 && (
                          <span className="mx-2 text-slate-300 select-none">/</span>
                        )}
                        <span
                          className={
                            itemValueClassName +
                            " break-words text-slate-700 transition-colors hover:text-black"
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
      className="w-full max-w-6xl"
    // contentClassName="overflow-hidden p-0"
    >
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

        <div className="about-tabs-layout lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
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

          <div className="min-w-0 bg-white p-4 lg:min-h-[36rem]">
            {visibleSectionIds.has("intro") && (
              <section
                id="about-panel-intro"
                data-about-panel="intro"
                aria-label="Lời giới thiệu"
                className={panelClassName}
              >
                {renderSectionHeader("intro")}

                <div className="space-y-4 text-sm/7 text-slate-800 sm:text-[15px]/7 lg:text-base/8 text-justify">
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
                {renderSectionHeader("social")}

                <ul className="max-w-4xl" role="list">
                  {visibleSocialLinks.map((link) => (
                    <li
                      key={link.name}
                      className="group/social border-b border-slate-100 last:border-b-0"
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
                        className="flex items-center gap-3 py-2 group-hover/social:text-sky-600 lg:py-4"
                      >
                        <span className={itemIconClassName}>
                          <i className={link.icon} aria-hidden="true" />
                        </span>

                        <span className="flex min-w-0 flex-1 flex-col">
                          <span
                            className={
                              itemValueClassName +
                              " block truncate"
                            }
                          >
                            {link.name}
                          </span>
                          {hasText(link.username) && (
                            <span
                              className={
                                itemLabelClassName +
                                " block truncate"
                              }
                            >
                              {link.username}
                            </span>
                          )}

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
    </PremiumGlassCard>
  );
}
