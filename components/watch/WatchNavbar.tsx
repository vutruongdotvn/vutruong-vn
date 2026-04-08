"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import WatchDropdown from "./WatchDropdown";
import type {
  OPhimCategory,
  OPhimCountry,
  OPhimListType,
} from "@/lib/watch/types";

type Props = {
  categories: OPhimCategory[];
  countries: OPhimCountry[];
  listTypes: OPhimListType[];
};

type MenuItem = {
  name: string;
  href: string;
  icon: string;
};

type MobileDropdownSectionProps = {
  title: string;
  icon: string;
  baseHref: string;
  items: { name: string; slug: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  delay?: number;
};

function MobileDropdownSection({
  title,
  icon,
  baseHref,
  items,
  isOpen,
  onToggle,
  onClose,
  delay = 0,
}: MobileDropdownSectionProps) {
  if (!items.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="rounded-3xl border border-white/10 bg-white/[0.045] p-2"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-white transition hover:bg-white/[0.05]"
      >
        <div className="flex items-center gap-3">
          <i className={`${icon} text-sm`} />
          <span className="text-sm font-semibold">{title}</span>
        </div>

        <i
          className={`fa-duotone fa-chevron-down text-xs text-white/55 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid max-h-[260px] grid-cols-1 gap-2 px-2 pb-2 pt-1 overflow-y-auto">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`${baseHref}/${item.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white/80 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                >
                  <span className="line-clamp-1 font-medium">{item.name}</span>
                  <i className="fa-duotone fa-arrow-up-right text-[11px] text-white/35" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WatchNavbar({
  categories,
  countries,
  listTypes,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  // MOBILE DROPDOWN STATE
  const [openMobileSection, setOpenMobileSection] = useState<
    "list" | "category" | "country" | null
  >(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const topCategories = useMemo(
    () => [...categories].filter((c) => c?.name && c?.slug).slice(0, 18),
    [categories]
  );

  const topCountries = useMemo(
    () => [...countries].filter((c) => c?.name && c?.slug).slice(0, 18),
    [countries]
  );

  const topListTypes = useMemo(
    () => [...listTypes].filter((c) => c?.name && c?.slug).slice(0, 12),
    [listTypes]
  );

  const mainMenu: MenuItem[] = [
    {
      name: "Trang chủ",
      href: "/watch",
      icon: "fa-duotone fa-house",
    },
    {
      name: "Phim mới",
      href: "/watch/browse/danh-sach/phim-moi-cap-nhat",
      icon: "fa-duotone fa-sparkles",
    },
    {
      name: "Phim lẻ",
      href: "/watch/browse/danh-sach/phim-le",
      icon: "fa-duotone fa-film",
    },
    {
      name: "Phim bộ",
      href: "/watch/browse/danh-sach/phim-bo",
      icon: "fa-duotone fa-clapperboard-play",
    },
  ];

  const mobileMenu: MenuItem[] = [...mainMenu];

  const isActive = (href: string) => {
    return href === "/watch" ? pathname === "/watch" : pathname.startsWith(href);
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const isSamePage = pathname === href;

    if (isSamePage) {
      e.preventDefault();
      setOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setOpen(false);
  };

  const handleScrollTop = () => {
    setOpen(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRefreshCurrent = () => {
    setOpen(false);
    router.refresh();
  };

  const closeMobileMenu = () => {
    setOpen(false);
    setOpenMobileSection(null);
  };

  const toggleMobileSection = (section: "list" | "category" | "country") => {
    setOpenMobileSection((prev) => (prev === section ? null : section));
  };

  // CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
        setOpenMobileSection(null);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // LOCK BODY SCROLL
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC CLOSE
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setOpenMobileSection(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // SCROLL HIDE / SHOW
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (open) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          if (currentScrollY < 32) {
            setVisible(true);
          } else if (diff > 6) {
            setVisible(false);
          } else if (diff < -6) {
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
    <>
      <header className="fixed top-0 left-0 z-[80] w-full select-none px-4 pt-4">
        <div className="mx-auto w-full max-w-[1680px]">
          <div
            className={`
              relative overflow-visible rounded-full border border-white/10
              bg-[#071225]/72 backdrop-blur-2xl
              shadow-[0_18px_60px_rgba(0,0,0,0.28)]
              transition-all duration-500 ease-out will-change-transform
              ${visible ? "translate-y-0 opacity-100" : "-translate-y-5 opacity-0"}
            `}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.08] via-transparent to-white/[0.04]" />

            <div className="relative flex h-[72px] items-center justify-between gap-3 px-3.5 py-2.5 md:px-4">
              {/* LOGO */}
              <Link
                href="/watch"
                onClick={(e) => handleNavClick(e, "/watch")}
                className="relative z-10 flex min-w-0 shrink-0 items-center gap-3 pl-1"
              >
                <div className="relative flex items-center justify-center">
                  <Image
                    src="/logo-white.png"
                    alt="VT Watch"
                    width={42}
                    height={42}
                    className="pointer-events-none shrink-0 rounded-full"
                    priority
                  />
                </div>

                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[17px] font-bold tracking-wide text-white">
                    VT Watch
                  </div>
                  <div className="hidden truncate text-[11px] text-white/55 md:block">
                    Xem phim online
                  </div>
                </div>
              </Link>

              {/* SEARCH */}
              <div className="relative z-10 hidden min-w-[280px] max-w-[380px] flex-1 lg:block">
                <div className="flex h-[46px] items-center gap-3 rounded-full border border-white/8 bg-white/[0.05] px-4 text-slate-300 shadow-inner">
                  <i className="fa-duotone fa-magnifying-glass text-sm text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm phim..."
                    className="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-white/35 outline-none"
                  />
                </div>
              </div>

              {/* DESKTOP MENU - GIỮ NGUYÊN */}
              <div className="relative z-10 hidden items-center gap-2 xl:flex">
                <nav className="flex items-center gap-1">
                  {mainMenu.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`
                          relative group flex items-center gap-2 rounded-full px-4 py-2.5
                          text-sm font-medium active:scale-95 transition-colors duration-300
                          ${
                            active
                              ? "text-white"
                              : "text-white/70 hover:text-white hover:bg-white/[0.06]"
                          }
                        `}
                      >
                        {active && (
                          <motion.span
                            layoutId="watch-active-nav-pill"
                            className="absolute inset-0 rounded-full bg-white/10 shadow-[0_8px_30px_rgba(255,255,255,0.04)]"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        <i
                          className={`${item.icon} relative z-10 text-[15px] transition-transform duration-300 ${
                            active ? "" : "group-hover:scale-105"
                          }`}
                        />
                        <span className="relative z-10 whitespace-nowrap">
                          {item.name}
                        </span>

                        {active && (
                          <span className="relative z-10 inline-block h-1.5 w-1.5 rounded-full bg-white/90" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                <div className="h-6 w-px bg-white/8" />

                <WatchDropdown
                  label="Danh sách"
                  icon="fa-duotone fa-rectangle-list"
                  items={listTypes}
                  baseHref="/watch/browse/danh-sach"
                />

                <WatchDropdown
                  label="Thể loại"
                  icon="fa-duotone fa-grid-2"
                  items={topCategories.map((c) => ({
                    name: c.name,
                    slug: c.slug,
                  }))}
                  baseHref="/watch/browse/the-loai"
                />

                <WatchDropdown
                  label="Quốc gia"
                  icon="fa-duotone fa-earth-asia"
                  items={topCountries.map((c) => ({
                    name: c.name,
                    slug: c.slug,
                  }))}
                  baseHref="/watch/browse/quoc-gia"
                />

                <div className="ml-1">
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
                    aria-label="Tài khoản"
                  >
                    <i className="fa-duotone fa-user text-[15px]" />
                  </button>
                </div>
              </div>

              {/* MOBILE BUTTON */}
              <button
                onClick={() => {
                  setOpen((prev) => !prev);
                  if (open) setOpenMobileSection(null);
                }}
                className="
                  relative z-10 xl:hidden h-11 w-11 flex items-center justify-center rounded-full
                  border border-white/10 bg-white/[0.06] hover:bg-white/[0.1]
                  transition-all duration-300 text-white cursor-pointer
                "
                aria-label="Open menu"
                aria-expanded={open}
              >
                <i
                  className={`fa-duotone transition-all duration-300 ${
                    open ? "fa-xmark text-[18px] rotate-90" : "fa-bars text-[18px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU - ĐÚNG KIỂU DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
  className="fixed inset-0 z-[999] xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/45 backdrop-blur-[3px]" />

            {/* SHEET */}
            <motion.div
              ref={menuRef}
              initial={{ y: 5, opacity: 0, scale: 1 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 5, opacity: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="absolute left-1/2 top-5 -translate-x-1/2 w-[calc(100%-24px)] max-w-md rounded-[2rem] border border-white/10 bg-[#0a1427]/92 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.38)] p-4"
            >
              {/* MOBILE TOP */}
              <div className="mb-4 mt-1 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    src="/logo-white.png"
                    alt="logo"
                    width={38}
                    height={38}
                    className="pointer-events-none shrink-0 rounded-full"
                    priority
                  />
                  <div className="min-w-0">
                    <Link
                      href="/watch"
                      onClick={(e) => handleNavClick(e, "/watch")}
                      className="block truncate font-semibold leading-5 text-white"
                    >
                      VT Watch
                    </Link>
                    <p className="truncate text-xs text-white/50">
                      Xem phim online
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeMobileMenu}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 shadow-sm hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <i className="fa-duotone fa-xmark" />
                </button>
              </div>

              {/* MOBILE SEARCH */}
              <div className="mb-4">
                <div className="flex h-[50px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-slate-300 shadow-inner">
                  <i className="fa-duotone fa-magnifying-glass text-sm text-white/45" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm phim..."
                    className="w-full bg-transparent text-[14px] font-medium text-white placeholder:text-white/35 outline-none"
                  />
                </div>
              </div>

              {/* MOBILE APP GRID */}
              <div className="grid grid-cols-2 gap-3">
                {mobileMenu.map((item, index) => {
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.28,
                        delay: 0.05 + index * 0.04,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          handleNavClick(e, item.href);
                          setOpen(false);
                          setOpenMobileSection(null);
                        }}
                        className={`
                          min-h-[96px] rounded-3xl p-4
                          flex flex-col justify-between
                          transition-all duration-300
                          ${
                            active
                              ? "bg-white/10 text-white shadow-lg"
                              : "bg-white/[0.05] text-white/80 hover:bg-white/[0.09]"
                          }
                        `}
                      >
                        <i className={`${item.icon} text-lg`} />

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold">
                            {item.name}
                          </span>

                          {active ? (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-white/90" />
                          ) : (
                            <i className="fa-duotone fa-arrow-up-right shrink-0 text-xs opacity-60" />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* MOBILE DROPDOWNS */}
              <div className="mt-4 space-y-3">
                <MobileDropdownSection
                  title="Danh sách"
                  icon="fa-duotone fa-rectangle-list"
                  baseHref="/watch/browse/danh-sach"
                  items={topListTypes.map((item) => ({
                    name: item.name,
                    slug: item.slug,
                  }))}
                  isOpen={openMobileSection === "list"}
                  onToggle={() => toggleMobileSection("list")}
                  onClose={closeMobileMenu}
                  delay={0.18}
                />

                <MobileDropdownSection
                  title="Thể loại"
                  icon="fa-duotone fa-grid-2"
                  baseHref="/watch/browse/the-loai"
                  items={topCategories.map((item) => ({
                    name: item.name,
                    slug: item.slug,
                  }))}
                  isOpen={openMobileSection === "category"}
                  onToggle={() => toggleMobileSection("category")}
                  onClose={closeMobileMenu}
                  delay={0.22}
                />

                <MobileDropdownSection
                  title="Quốc gia"
                  icon="fa-duotone fa-earth-asia"
                  baseHref="/watch/browse/quoc-gia"
                  items={topCountries.map((item) => ({
                    name: item.name,
                    slug: item.slug,
                  }))}
                  isOpen={openMobileSection === "country"}
                  onToggle={() => toggleMobileSection("country")}
                  onClose={closeMobileMenu}
                  delay={0.26}
                />
              </div>

              {/* QUICK ACTIONS */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleScrollTop}
                  className="rounded-2xl bg-white/[0.06] px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.12] cursor-pointer"
                >
                  <i className="fa-duotone fa-arrow-up mr-2" />
                  Top
                </button>

                <button
                  onClick={handleRefreshCurrent}
                  className="rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-black transition-all hover:opacity-90 cursor-pointer"
                >
                  <i className="fa-duotone fa-rotate-right mr-2" />
                  Refresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}