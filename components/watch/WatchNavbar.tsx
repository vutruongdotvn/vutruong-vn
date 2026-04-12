"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getAvatarImage } from "@/lib/cloudinary";
import LoginModal from "@/components/auth/LoginModal";
import CreatePostModal from "@/components/blog/CreatePostModal";
import WatchDropdown from "./WatchDropdown";
import type {
  OPhimCategory,
  OPhimCountry,
  OPhimListType,
} from "@/lib/watch/types";

import {
  normalizeCategories,
  normalizeCountries,
  normalizeListTypes,
} from "@/lib/watch/menu";
import SearchModal from "@/components/watch/SearchModal";

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
          className={`fa-duotone fa-chevron-down text-xs text-white/55 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
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
            <div className="grid grid-cols-2 gap-2 px-2 pb-2 pt-3">
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

  const [userOpen, setUserOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [openSearch, setOpenSearch] = useState(false); // modal search

  // MOBILE DROPDOWN STATE
  const [openMobileSection, setOpenMobileSection] = useState<
    "list" | "category" | "country" | null
  >(null);

  const { user, role, loading: userLoading } = useUser();

  const menuRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const lastFetchedUserId = useRef<string | null>(null);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const finalCategories = normalizeCategories(categories);
  const finalCountries = normalizeCountries(countries);
  const finalListTypes = normalizeListTypes(listTypes);

  const mainMenu: MenuItem[] = [
    {
      name: "Trang chủ",
      href: "/watch",
      icon: "fa-duotone fa-house",
    },
    {
      name: "Tìm kiếm",
      href: "/watch/search/",
      icon: "fa-duotone fa-search",
    },
    {
      name: "Phim lẻ",
      href: "/watch/danh-sach/phim-le",
      icon: "fa-duotone fa-film",
    },
    {
      name: "Phim bộ",
      href: "/watch/danh-sach/phim-bo",
      icon: "fa-duotone fa-clapperboard-play",
    },
  ];

  const mobileMenu: MenuItem[] = mainMenu.filter(
  (item) => item.name !== "Tìm kiếm"
);

  // =========================
  // PROFILE FETCH
  // =========================
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("WatchNavbar fetchProfile error:", error);
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (err) {
      console.error("WatchNavbar fetchProfile crash:", err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      lastFetchedUserId.current = null;
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (lastFetchedUserId.current === user.id) {
      setProfileLoading(false);
      return;
    }

    lastFetchedUserId.current = user.id;
    setProfileLoading(true);
    fetchProfile();
  }, [user, userLoading]);

  const fullName = user ? profile?.name || "User" : "Xin chào! 👋";
  const email = user?.email || "";
  const avatar = user
    ? getAvatarImage(profile?.avatar) || "/images/default.jpg"
    : "/images/default.jpg";

  const isActive = (href: string) => {
    return href === "/watch" ? pathname === "/watch" : pathname.startsWith(href);
  };

  const closeDesktopUser = () => {
    setUserOpen(false);
  };

  const closeMobileMenu = () => {
    setOpen(false);
    setOpenMobileSection(null);
  };

  const closeAll = () => {
    setOpen(false);
    setOpenMobileSection(null);
    setUserOpen(false);
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const isSamePage = pathname === href;

    if (isSamePage) {
      e.preventDefault();
      closeAll();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      router.refresh();
      return;
    }

    closeAll();
  };

  const handleScrollTop = () => {
    closeAll();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRefreshCurrent = () => {
    closeAll();
    router.refresh();
  };

  const toggleMobileSection = (section: "list" | "category" | "country") => {
    setOpenMobileSection((prev) => (prev === section ? null : section));
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("WatchNavbar sign out error:", error);
      return;
    }

    closeAll();
    setProfile(null);
  };

  // CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
        setOpenMobileSection(null);
      }

      if (userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
    }

    if (open || userOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, userOpen]);

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
        closeAll();
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
        <div className="mx-auto flex w-full justify-center">
          <div
            className={`
              ${visible
                ? "backdrop-blur-sm"
                : "shadow-[0_18px_60px_rgba(0,0,0,0.3)] backdrop-blur-lg"
              }
              relative inline-flex w-fit max-w-full overflow-visible rounded-full border border-white/10
              transition-all duration-500 ease-out will-change-transform hover:bg-white/10 hover:border-white/20
            `}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.08] via-transparent to-white/[0.04]" />

            <div
              className={`relative flex items-center justify-center gap-12 px-1 py-1 pl-2 transition-all duration-500 ease-out will-change`}
            >
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
                  <div className="truncate text-xl font-bold tracking-wide text-white">
                    Watch
                  </div>
                </div>
              </Link>

              {/* DESKTOP MENU */}
              <div className="relative z-10 hidden items-center gap-1 xl:flex">
                <nav className="flex items-center gap-1">
                  {mainMenu.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        prefetch
                        onClick={(e) => {
                          if (item.name === "Tìm kiếm") {
                            e.preventDefault();
                            setOpenSearch(true);
                            return;
                          }
                          handleNavClick(e, item.href);
                        }}
                        className={`
                          relative group flex items-center gap-2 rounded-full px-4 py-2.5
                          text-sm font-medium active:scale-95 transition-colors duration-300
                          ${active
                            ? "text-white"
                            : "text-white/70 hover:bg-white/[0.06] hover:text-white"
                          }
                        `}
                      >
                        {active && (
                          <motion.span
                            layoutId="watch-active-nav-pill"
                            className="absolute inset-0 rounded-full bg-white/15 backdrop-blur-sm border border-white/20"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        <i
                          className={`${item.icon} relative z-10 text-[15px] transition-transform duration-300 ${active ? "" : "group-hover:scale-105"
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

                {/*
                <WatchDropdown
                  label="Danh sách"
                  icon="fa-duotone fa-rectangle-list"
                  items={finalListTypes}
                  baseHref="/watch/danh-sach"
                />
                */}

                <WatchDropdown
                  align="right"
                  label="Thể loại"
                  icon="fa-duotone fa-grid-2"
                  items={finalCategories}
                  baseHref="/watch/the-loai"
                />

                <WatchDropdown
                  align="right"
                  label="Quốc gia"
                  icon="fa-duotone fa-earth-asia"
                  items={finalCountries}
                  baseHref="/watch/quoc-gia"
                />

                {/* DESKTOP USER */}
                <div className="relative ml-1" ref={userRef}>
                  <button
                    onClick={() => setUserOpen((prev) => !prev)}
                    className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 transition hover:bg-white/[0.08] hover:text-white active:scale-95"
                    aria-label="Tài khoản"
                    aria-expanded={userOpen}
                  >
                    {user ? (
                      <Image
                        src={avatar}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <i className="fa-duotone fa-user text-base" />
                    )}
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+14px)] w-80 rounded-3xl border border-white/10 bg-black p-3 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                      >
                        <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
                          <Image
                            src={avatar}
                            alt="avatar"
                            width={52}
                            height={52}
                            className="h-[52px] w-[52px] rounded-full object-cover shadow-lg"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1 truncate text-base font-semibold text-white">
                              <span className="truncate">{fullName}</span>

                              {user && role === "admin" && (
                                <i
                                  className="fa-duotone fa-badge-check shrink-0 text-xs text-blue-400"
                                  title="Tài khoản đã xác thực"
                                />
                              )}
                            </p>

                            <p className="truncate text-sm text-white/60">
                              {user ? email : "Bạn chưa đăng nhập"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-1.5">
                          {user && (
                            <Link
                              href="/profile"
                              onClick={closeDesktopUser}
                              className="flex items-center justify-between rounded-2xl px-4 py-3 text-white/85 hover:bg-white/[0.06] active:scale-97 active:bg-white/[0.08]"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-user text-base" />
                                <span className="text-sm font-medium">
                                  Trang cá nhân
                                </span>
                              </div>
                              <i className="fa-duotone fa-arrow-up-right text-xs text-white/40" />
                            </Link>
                          )}

                          {user && role === "admin" && (
                            <button
                              onClick={() => {
                                setUserOpen(false);
                                setShowCreatePost(true);
                              }}
                              className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-white/85 hover:bg-white/[0.06] active:scale-97 active:bg-white/[0.08]"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-pen-to-square text-base" />
                                <span className="text-sm font-medium">
                                  Đăng bài viết
                                </span>
                              </div>
                              <i className="fa-duotone fa-plus text-xs text-white/40" />
                            </button>
                          )}

                          {!user ? (
                            <button
                              onClick={() => {
                                setUserOpen(false);
                                setShowLogin(true);
                              }}
                              className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-white/85 hover:bg-white/[0.06] active:scale-97 active:bg-white/[0.08]"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-user-gear text-base" />
                                <span className="text-sm font-medium">
                                  Đăng nhập
                                </span>
                              </div>
                              <i className="fa-duotone fa-arrow-right text-xs text-white/40" />
                            </button>
                          ) : (
                            <button
                              onClick={handleLogout}
                              className="flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-red-400 hover:bg-red-500/10 active:scale-97 active:bg-red-500/15"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-arrow-right-from-bracket text-base" />
                                <span className="text-sm font-medium">
                                  Đăng xuất
                                </span>
                              </div>
                              <i className="fa-duotone fa-arrow-right text-xs text-red-300/70" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* MOBILE BUTTON */}
              <button
                onClick={() => {
                  setOpen((prev) => !prev);
                  if (open) setOpenMobileSection(null);
                }}
                className="
                  relative z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full
                  border border-white/10 bg-white/[0.06] text-white transition-all duration-300
                  hover:bg-white/[0.1] xl:hidden
                "
                aria-label="Open menu"
                aria-expanded={open}
              >
                <i
                  className={`fa-duotone text-[18px] transition-all duration-300 ${open ? "fa-xmark rotate-90" : "fa-bars"
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
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
              className="absolute left-1/2 top-5 w-[calc(100%-24px)] max-w-md max-h-screen overflow-auto -translate-x-1/2 rounded-[2rem] border border-white/10 bg-black/50 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl scrollbar-hide"
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
                      className="block truncate text-lg font-semibold leading-5 text-white"
                    >
                      Watch
                    </Link>
                  </div>
                </div>

                <button
                  onClick={closeMobileMenu}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 shadow-sm hover:text-white"
                  aria-label="Close menu"
                >
                  <i className="fa-duotone fa-xmark" />
                </button>
              </div>

              {/* MOBILE ACCOUNT BLOCK */}
              <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.045] px-4 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Image
                    src={avatar}
                    alt="avatar"
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover shadow-md"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-base font-semibold text-white">
                      <span className="truncate">{fullName}</span>

                      {user && role === "admin" && (
                        <i
                          className="fa-duotone fa-badge-check shrink-0 text-xs text-blue-400"
                          title="Tài khoản đã xác thực"
                        />
                      )}
                    </p>

                    <p className="truncate text-sm text-white/60">
                      {user ? email : "Bạn chưa đăng nhập."}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {user && (
                    <Link
                      href="/profile"
                      onClick={closeMobileMenu}
                      className="rounded-2xl bg-white/[0.06] px-4 py-3.5 text-center text-sm font-medium text-white transition-all hover:bg-white/[0.12]"
                    >
                      <i className="fa-duotone fa-user mr-2" />
                      Cá nhân
                    </Link>
                  )}

                  {user && role === "admin" && (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        setShowCreatePost(true);
                      }}
                      className="cursor-pointer rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-black transition-all hover:opacity-90"
                    >
                      <i className="fa-duotone fa-pen-to-square mr-2" />
                      Đăng
                    </button>
                  )}

                  {!user && (
                    <button
                      onClick={() => {
                        closeMobileMenu();
                        setShowLogin(true);
                      }}
                      className="col-span-2 cursor-pointer rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-black transition-all hover:opacity-90"
                    >
                      <i className="fa-duotone fa-user-gear mr-2" />
                      Đăng nhập
                    </button>
                  )}

                  {user && (
                    <button
                      onClick={handleLogout}
                      className={`${role === "admin" ? "col-span-2" : "col-span-1"
                        } cursor-pointer rounded-2xl bg-red-500/10 px-4 py-3.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/15`}
                    >
                      <i className="fa-duotone fa-arrow-right-from-bracket mr-2" />
                      Đăng xuất
                    </button>
                  )}
                </div>
              </div>

              {/* MOBILE SEARCH */}
              <div className="mb-4">
                <div className="flex h-[50px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-slate-300 shadow-inner">
                  <i className="fa-duotone fa-magnifying-glass text-sm text-white/45" />
                  <input
                    value={query}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query.trim()) {
                        closeMobileMenu();
                        router.push(`/watch/search?q=${encodeURIComponent(query)}`);
                      }
                    }}
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
                          flex min-h-[96px] flex-col justify-between rounded-3xl p-4
                          transition-all duration-300
                          ${active
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
                {/*
                <MobileDropdownSection
                  title="Danh sách"
                  icon="fa-duotone fa-rectangle-list"
                  baseHref="/watch/danh-sach"
                  items={finalListTypes}
                  isOpen={openMobileSection === "list"}
                  onToggle={() => toggleMobileSection("list")}
                  onClose={closeMobileMenu}
                />
                */}

                <MobileDropdownSection
                  title="Thể loại"
                  icon="fa-duotone fa-grid-2"
                  baseHref="/watch/the-loai"
                  items={finalCategories}
                  isOpen={openMobileSection === "category"}
                  onToggle={() => toggleMobileSection("category")}
                  onClose={closeMobileMenu}
                />

                <MobileDropdownSection
                  title="Quốc gia"
                  icon="fa-duotone fa-earth-asia"
                  baseHref="/watch/quoc-gia"
                  items={finalCountries}
                  isOpen={openMobileSection === "country"}
                  onToggle={() => toggleMobileSection("country")}
                  onClose={closeMobileMenu}
                />
              </div>

              {/* QUICK ACTIONS */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleScrollTop}
                  className="cursor-pointer rounded-2xl bg-white/[0.06] px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/[0.12]"
                >
                  <i className="fa-duotone fa-arrow-up mr-2" />
                  Top
                </button>

                <button
                  onClick={handleRefreshCurrent}
                  className="cursor-pointer rounded-2xl bg-white px-4 py-3.5 text-sm font-medium text-black transition-all hover:opacity-90"
                >
                  <i className="fa-duotone fa-rotate-right mr-2" />
                  Refresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS */}
      {user && role === "admin" && (
        <CreatePostModal
          isOpen={showCreatePost}
          editingPost={null}
          onSuccess={(newPost) => {
            window.dispatchEvent(
              new CustomEvent("blog-post-created", {
                detail: newPost,
              })
            );
          }}
          onClose={() => setShowCreatePost(false)}
        />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      <SearchModal
        open={openSearch}
        onClose={() => setOpenSearch(false)}
      />
    </>
  );
}