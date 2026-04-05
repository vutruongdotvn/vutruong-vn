"use client";

import { useEffect, useMemo, useState } from "react";

type ShortcutItem = {
  title: string;
  url: string;
  icon: string;
  bgClass: string;
};

const shortcuts: ShortcutItem[] = [
  {
    title: "Facebook",
    url: "https://www.facebook.com/",
    icon: "fa-brands fa-facebook-f",
    bgClass: "from-sky-500 to-blue-600",
  },
  {
    title: "YouTube",
    url: "https://www.youtube.com/",
    icon: "fa-brands fa-youtube",
    bgClass: "from-red-500 to-red-600",
  },
  {
    title: "Instagram",
    url: "https://www.instagram.com/",
    icon: "fa-brands fa-instagram",
    bgClass: "from-purple-500 via-pink-500 to-amber-300",
  },
  {
    title: "TikTok",
    url: "https://www.tiktok.com/",
    icon: "fa-brands fa-tiktok",
    bgClass: "from-black to-black",
  },
  {
    title: "Gmail",
    url: "https://mail.google.com/",
    icon: "fa-duotone fa-envelope",
    bgClass: "from-red-500 to-red-500",
  },
  {
    title: "Google Dịch",
    url: "https://translate.google.com/",
    icon: "fa-duotone fa-language",
    bgClass: "from-blue-400 to-blue-500",
  },
  {
    title: "Telegram",
    url: "https://web.telegram.org/",
    icon: "fa-brands fa-telegram",
    bgClass: "from-sky-500 to-sky-500",
  },
  {
    title: "Zalo",
    url: "https://chat.zalo.me/",
    icon: "fa-duotone fa-comment-dots",
    bgClass: "from-sky-400 to-sky-500",
  },
  {
    title: "SoundCloud",
    url: "https://soundcloud.com/",
    icon: "fa-brands fa-soundcloud",
    bgClass: "from-indigo-500 to-indigo-600",
  },
  {
    title: "VT Films",
    url: "//films.vutruong.vn",
    icon: "fa-duotone fa-film",
    bgClass: "from-purple-700 to-purple-700",
  },
];

export default function WelcomePage() {
  const [now, setNow] = useState<Date>(new Date());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    const weekdays = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];

    const weekday = weekdays[now.getDay()];
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    return `${weekday}, ngày ${day} tháng ${month} năm ${year}`;
  }, [now]);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  }, [now]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (!trimmed) return;

    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
      trimmed
    )}`;
    window.open(googleUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen bg-[#e9e9eb] text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col items-center px-6 pb-16 pt-14">
        {/* Date */}
        <p className="mb-1 text-center text-[26px] font-medium tracking-tight text-black md:text-[32px]">
          {formattedDate}
        </p>

        {/* Clock */}
        <h1
          className="select-none text-center font-black leading-none tracking-[-0.06em] text-black"
          style={{
            fontSize: "clamp(5.5rem, 13vw, 11rem)",
          }}
        >
          {formattedTime}
        </h1>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mt-14 flex w-full justify-center"
        >
          <div className="flex h-[56px] w-full max-w-[560px] items-center rounded-full bg-white px-5 shadow-sm">
            <div className="mr-4 shrink-0">
              <img
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzIiIGhlaWdodD0iOTIiPjxwYXRoIGZpbGw9IiNFQTQzMzUiIGQ9Ik0xMTUuNzUgNDcuMThjMCAxMi43Ny05Ljk5IDIyLjE4LTIyLjI1IDIyLjE4cy0yMi4yNS05LjQxLTIyLjI1LTIyLjE4QzcxLjI1IDM0LjMyIDgxLjI0IDI1IDkzLjUgMjVzMjIuMjUgOS4zMiAyMi4yNSAyMi4xOHptLTkuNzQgMGMwLTcuOTgtNS43OS0xMy40NC0xMi41MS0xMy40NFM4MC45OSAzOS4yIDgwLjk5IDQ3LjE4YzAgNy45IDUuNzkgMTMuNDQgMTIuNTEgMTMuNDRzMTIuNTEtNS41NSAxMi41MS0xMy40NHoiLz48cGF0aCBmaWxsPSIjRkJCQzA1IiBkPSJNMTYzLjc1IDQ3LjE4YzAgMTIuNzctOS45OSAyMi4xOC0yMi4yNSAyMi4xOHMtMjIuMjUtOS40MS0yMi4yNS0yMi4xOGMwLTEyLjg1IDkuOTktMjIuMTggMjIuMjUtMjIuMThzMjIuMjUgOS4zMiAyMi4yNSAyMi4xOHptLTkuNzQgMGMwLTcuOTgtNS43OS0xMy40NC0xMi41MS0xMy40NHMtMTIuNTEgNS40Ni0xMi41MSAxMy40NGMwIDcuOSA1Ljc5IDEzLjQ0IDEyLjUxIDEzLjQ0czEyLjUxLTUuNTUgMTIuNTEtMTMuNDR6Ii8+PHBhdGggZmlsbD0iIzQyODVGNCIgZD0iTTIwOS43NSAyNi4zNHYzOS44MmMwIDE2LjM4LTkuNjYgMjMuMDctMjEuMDggMjMuMDctMTAuNzUgMC0xNy4yMi03LjE5LTE5LjY2LTEzLjA3bDguNDgtMy41M2MxLjUxIDMuNjEgNS4yMSA3Ljg3IDExLjE3IDcuODcgNy4zMSAwIDExLjg0LTQuNTEgMTEuODQtMTN2LTMuMTloLS4zNGMtMi4xOCAyLjY5LTYuMzggNS4wNC0xMS42OCA1LjA0LTExLjA5IDAtMjEuMjUtOS42Ni0yMS4yNS0yMi4wOSAwLTEyLjUyIDEwLjE2LTIyLjI2IDIxLjI1LTIyLjI2IDUuMjkgMCA5LjQ5IDIuMzUgMTEuNjggNC45NmguMzR2LTMuNjFoOS4yNXptLTguNTYgMjAuOTJjMC03LjgxLTUuMjEtMTMuNTItMTEuODQtMTMuNTItNi43MiAwLTEyLjM1IDUuNzEtMTIuMzUgMTMuNTIgMCA3LjczIDUuNjMgMTMuMzYgMTIuMzUgMTMuMzYgNi42MyAwIDExLjg0LTUuNjMgMTEuODQtMTMuMzZ6Ii8+PHBhdGggZmlsbD0iIzM0QTg1MyIgZD0iTTIyNSAzdjY1aC05LjVWM2g5LjV6Ii8+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI2Mi4wMiA1NC40OGw3LjU2IDUuMDRjLTIuNDQgMy42MS04LjMyIDkuODMtMTguNDggOS44My0xMi42IDAtMjIuMDEtOS43NC0yMi4wMS0yMi4xOCAwLTEzLjE5IDkuNDktMjIuMTggMjAuOTItMjIuMTggMTEuNTEgMCAxNy4xNCA5LjE2IDE4Ljk4IDE0LjExbDEuMDEgMi41Mi0yOS42NSAxMi4yOGMyLjI3IDQuNDUgNS44IDYuNzIgMTAuNzUgNi43MiA0Ljk2IDAgOC40LTIuNDQgMTAuOTItNi4xNHptLTIzLjI3LTcuOThsMTkuODItOC4yM2MtMS4wOS0yLjc3LTQuMzctNC43LTguMjMtNC43LTQuOTUgMC0xMS44NCA0LjM3LTExLjU5IDEyLjkzeiIvPjxwYXRoIGZpbGw9IiM0Mjg1RjQiIGQ9Ik0zNS4yOSA0MS40MVYzMkg2N2MuMzEgMS42NC40NyAzLjU4LjQ3IDUuNjggMCA3LjA2LTEuOTMgMTUuNzktOC4xNSAyMi4wMS02LjA1IDYuMy0xMy43OCA5LjY2LTI0LjAyIDkuNjZDMTYuMzIgNjkuMzUuMzYgNTMuODkuMzYgMzQuOTEuMzYgMTUuOTMgMTYuMzIuNDcgMzUuMy40N2MxMC41IDAgMTcuOTggNC4xMiAyMy42IDkuNDlsLTYuNjQgNi42NGMtNC4wMy0zLjc4LTkuNDktNi43Mi0xNi45Ny02LjcyLTEzLjg2IDAtMjQuNyAxMS4xNy0yNC43IDI1LjAzIDAgMTMuODYgMTAuODQgMjUuMDMgMjQuNyAyNS4wMyA4Ljk5IDAgMTQuMTEtMy42MSAxNy4zOS02Ljg5IDIuNjYtMi42NiA0LjQxLTYuNDYgNS4xLTExLjY1bC0yMi40OS4wMXoiLz48L3N2Zz4="
                alt="Google"
                className="h-[22px] w-auto object-contain"
                draggable={false}
              />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm"
              className="h-full w-full bg-transparent text-[17px] text-gray-700 outline-none placeholder:text-gray-400"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </form>

        {/* Shortcuts */}
        <section className="mt-16 w-full max-w-[1020px]">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
            {shortcuts.map((item) => {
              const isInternal = item.url.startsWith("/");

              return (
                <a
                  key={item.title}
                  href={item.url}
                  target={isInternal ? "_self" : "_blank"}
                  rel={isInternal ? undefined : "noopener noreferrer"}
                  className={`group flex h-[124px] flex-col items-center justify-center rounded-[10px] bg-gradient-to-br ${item.bgClass} px-4 text-white shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md`}
                >
                  <i
                    className={`${item.icon} text-[34px] leading-none text-white transition-transform duration-200 group-hover:scale-105`}
                  />
                  <span className="mt-4 text-center text-[15px] font-semibold">
                    {item.title}
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}