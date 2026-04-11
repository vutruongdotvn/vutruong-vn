import type { WatchSectionConfig, WatchTopic } from "./types";

export const HOME_SECTIONS: WatchSectionConfig[] = [
  { id: "VTFsl_hanh-dong", ti: "Phim", hi: "Hành Động", api: "/the-loai/hanh-dong", type: "the-loai", slug: "hanh-dong" },
  { id: "VTFsl_tinh-cam", ti: "Phim", hi: "Tình Cảm", api: "/the-loai/tinh-cam", type: "the-loai", slug: "tinh-cam" },
  { id: "VTFsl_kinh-di", ti: "Phim", hi: "Kinh Dị", api: "/the-loai/kinh-di", type: "the-loai", slug: "kinh-di" },
  { id: "VTFsl_hai-huoc", ti: "Phim", hi: "Hài Hước", api: "/the-loai/hai-huoc", type: "the-loai", slug: "hai-huoc" },
  { id: "VTFsl_co-trang", ti: "Phim", hi: "Cổ Trang", api: "/the-loai/co-trang", type: "the-loai", slug: "co-trang" },
  { id: "VTFsl_viet-nam", ti: "Phim", hi: "Việt Nam", api: "/quoc-gia/viet-nam", type: "quoc-gia", slug: "viet-nam" },
  { id: "VTFsl_han-quoc", ti: "Phim", hi: "Hàn Quốc", api: "/quoc-gia/han-quoc", type: "quoc-gia", slug: "han-quoc" },
  { id: "VTFsl_trung-quoc", ti: "Phim", hi: "Trung Quốc", api: "/quoc-gia/trung-quoc", type: "quoc-gia", slug: "trung-quoc" },
  { id: "VTFsl_au-my", ti: "Phim", hi: "Âu Mỹ", api: "/quoc-gia/au-my", type: "quoc-gia", slug: "au-my" },
  { id: "VTFsl_tv-shows", ti: "TV", hi: "Shows", api: "/danh-sach/tv-shows", type: "danh-sach", slug: "tv-shows" },
];

export const TOPIC_ITEMS: (WatchTopic & { gradient: string })[] = [
  {
    label: "Thuyết Minh",
    type: "danh-sach",
    slug: "phim-thuyet-minh",
    cls: "vt-topic-1",
    gradient: "from-pink-500 to-rose-400",
  },
  {
    label: "Lồng Tiếng Cực Mạnh",
    type: "danh-sach",
    slug: "phim-long-tieng",
    cls: "vt-topic-2",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    label: "Vietsub",
    type: "danh-sach",
    slug: "phim-vietsub",
    cls: "vt-topic-3",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    label: "Xuyên Không",
    type: "the-loai",
    slug: "vien-tuong",
    cls: "vt-topic-4",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    label: "Cổ Trang",
    type: "the-loai",
    slug: "co-trang",
    cls: "vt-topic-5",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    label: "Phim Chiếu Rạp",
    type: "danh-sach",
    slug: "phim-chieu-rap",
    cls: "vt-topic-6",
    gradient: "from-indigo-500 to-violet-400",
  },
  {
    label: "Phim Việt Nam",
    type: "quoc-gia",
    slug: "viet-nam",
    cls: "vt-topic-7",
    gradient: "from-pink-500 to-fuchsia-500",
  },
  {
    label: "TV Shows",
    type: "danh-sach",
    slug: "tv-shows",
    cls: "vt-topic-8",
    gradient: "from-yellow-500 to-lime-400",
  },
];