"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // MENU CONFIG
  const menu = [
    { name: "Home", href: "/", icon: "fa-duotone fa-house" },
    { name: "Bio", href: "/bio", icon: "fa-duotone fa-users" },
    { name: "Project", href: "/project", icon: "fa-duotone fa-code" },
    { name: "Contact", href: "/contact", icon: "fa-duotone fa-envelope" },
    { name: "Blog", href: "/blog", icon: "fa-duotone fa-comment-pen" },
  ];

  // ACTIVE LOGIC
  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  // CLICK LINK REFRESH / SAME PAGE LOGIC
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const isSamePage = pathname === href;
    const isCurrentBlog = pathname === "/blog" && href === "/blog";

    // Nếu đang ở đúng /blog -> refresh feed
    if (isCurrentBlog) {
      e.preventDefault();

      // Đóng menu mobile nếu đang mở
      setOpen(false);

      // Scroll về đầu trang
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Bắn event để BlogPostFeed tự refresh dữ liệu
      setTimeout(() => {
        window.dispatchEvent(new Event("refresh-blog-feed"));
      }, 250);

      // Nếu sau này /blog có Server Components fetch data
      // có thể bật thêm dòng này:
      // router.refresh();

      return;
    }

    // Nếu click lại đúng trang hiện tại (không phải blog) -> không làm gì cả
    if (isSamePage) {
      e.preventDefault();
      setOpen(false);
    }
  };

  // AUTO TITLE
  const current = menu.find((item) => isActive(item.href));
  const title = current?.name || "VT Zone";

  // LINK hiện tại của chính trang đang đứng
  const currentPageHref = current?.href || pathname || "/";

  // CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // SCROLL STATE + AUTO HIDE / SHOW
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 18);

      // Khi menu mobile đang mở -> luôn hiện navbar, tránh bug UX
      if (open) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          // Luôn hiện khi ở gần đầu trang
          if (currentScrollY < 120) {
            setVisible(true);
          }
          // Scroll xuống -> ẩn
          else if (diff > 5) {
            setVisible(false);
          }
          // Scroll lên -> hiện
          else if (diff < -5) {
            setVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <header className="fixed top-0 left-0 w-full z-40 flex justify-center px-4 pt-4 select-none">
      <div className="w-[calc(100%-0rem)] max-w-3xl">
        {/* NAVBAR */}
        <div
          className={`
            relative flex items-center justify-between
            rounded-full border border-white/60
            bg-white/60 backdrop-blur-xl
            shadow-[0_8px_30px_rgba(0,0,0,0.05)]
            transition-all duration-500 ease-out will-change-transform
            ${scrolled ? "p-2" : "p-3"}
            ${
              visible
                ? "translate-y-0 opacity-100"
                : "-translate-y-3 opacity-0 pointer-events-none"
            }
          `}
        >
          {/* LOGO + TITLE */}
          <Link
            href={currentPageHref}
            onClick={(e) => handleNavClick(e, currentPageHref)}
            className="relative z-10 flex items-center gap-2.5 pl-1"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={40}
              height={40}
              className={`
                pointer-events-none transition-all duration-300
                ${scrolled ? "w-10 h-10" : "w-10 h-10"}
              `}
              priority
            />

            <span
              className={`
                font-bold tracking-wide text-gray-900 transition-all duration-300
                ${scrolled ? "text-lg" : "text-lg"}
              `}
            >
              {title}
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="relative z-10 hidden md:flex items-center gap-1">
            {menu.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`
                    group relative flex items-center gap-2
                    rounded-full px-4 py-2.5 active:scale-95
                    text-sm font-medium
                    ${
                      active
                        ? "bg-black text-white shadow-lg hover:shadow-xl"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                    }
                  `}
                >
                  <i
                    className={`${item.icon} text-base transition-transform duration-300 ${
                      active ? "" : "group-hover:scale-105"
                    }`}
                  />

                  <span>{item.name}</span>

                  {active && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/90" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="
              relative z-10 md:hidden
              w-11 h-11 flex items-center justify-center
              rounded-full border border-gray-100
              bg-white/70 hover:bg-white
              shadow-sm transition-all duration-300
              text-gray-700 hover:text-black
              cursor-pointer
            "
            aria-label="Open menu"
          >
            <i
              className={`fa-duotone transition-all duration-300 ${
                open ? "fa-xmark text-[18px]" : "fa-bars text-[18px]"
              }`}
            />
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
            open ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/50" />

          {/* SLIDE PANEL */}
          <div
            ref={menuRef}
            className={`absolute top-0 right-0 h-full w-80 max-w-[88vw]
            bg-white/88 backdrop-blur-xl border-l border-white/70
            shadow-2xl p-5 transform transition-transform duration-300 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* MOBILE TOP */}
            <div className="flex items-center justify-between mb-6 mt-1">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={36}
                  height={36}
                  className="pointer-events-none"
                  priority
                />
                <div>
                  <Link
                    href={currentPageHref}
                    onClick={(e) => handleNavClick(e, currentPageHref)}
                    className="font-semibold text-gray-900 leading-5"
                  >
                    {title}
                  </Link>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-black cursor-pointer"
                aria-label="Close menu"
              >
                <i className="fa-duotone fa-xmark" />
              </button>
            </div>

            {/* MOBILE MENU ITEMS */}
            <div className="flex flex-col gap-2">
              {menu.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      handleNavClick(e, item.href);

                      if (!(pathname === "/blog" && item.href === "/blog")) {
                        setOpen(false);
                      }
                    }}
                    className={`
                      flex items-center justify-between
                      rounded-2xl px-4 py-3.5
                      text-sm font-medium transition-all duration-300
                      ${
                        active
                          ? "bg-gray-900 text-white shadow-sm"
                          : "bg-white/60 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`${item.icon} text-base`} />
                      <span>{item.name}</span>
                    </div>

                    {active ? (
                      <span className="w-2 h-2 rounded-full bg-white/90" />
                    ) : (
                      <i className="fa-duotone fa-arrow-right text-gray-400 text-xs" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}