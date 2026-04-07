"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getAvatarImage } from "@/lib/cloudinary";
import CreatePostModal from "@/components/blog/CreatePostModal";
import LoginModal from "@/components/auth/LoginModal";

type MenuItem = {
  name: string;
  href: string;
  icon: string;
};

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const pathname = usePathname();
  const router = useRouter();

  const { user, role, loading: userLoading } = useUser();

  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const lastFetchedUserId = useRef<string | null>(null);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // =========================
  // MENU CONFIG
  // =========================
  const mainMenu: MenuItem[] = [
    { name: "Home", href: "/", icon: "fa-duotone fa-house" },
    { name: "Blog", href: "/blog", icon: "fa-duotone fa-comment-pen" },
  ];

  const moreMenu: MenuItem[] = [
    { name: "Bio", href: "/bio", icon: "fa-duotone fa-users" },
    { name: "Project", href: "/project", icon: "fa-duotone fa-code" },
    { name: "Contact", href: "/contact", icon: "fa-duotone fa-envelope" },
    // { name: "Watch", href: "/watch", icon: "fa-duotone fa-clapperboard-play" },
    // { name: "Secret", href: "/secret", icon: "fa-duotone fa-lock-keyhole" },
  ];

  const mobileMenu: MenuItem[] = [...mainMenu, ...moreMenu];

  // =========================
  // PAGE META
  // =========================
  const pageMeta = useMemo(
    () => ({
      "/": { title: "Home", subtitle: "VT Zone" },
      "/bio": { title: "Bio", subtitle: "Kết nối với mình" },
      "/project": { title: "Project", subtitle: "Dự án đã hoàn thành" },
      "/contact": { title: "Contact", subtitle: "Liên hệ" },
      "/blog": { title: "Blog", subtitle: "Thế giới nội tâm" },
      // "/watch": { title: "Watch", subtitle: "Films & cinema" },
      // "/secret": { title: "Secret", subtitle: "Trang nội bộ" },
      "/profile": { title: "Profile", subtitle: "Chỉnh sửa thông tin" },
    }),
    []
  );

  // =========================
  // PROFILE FETCH (same spirit as BlogUserPanel)
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
        console.error("Navbar fetchProfile error:", error);
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (err) {
      console.error("Navbar fetchProfile crash:", err);
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

  const authReady = !userLoading && !profileLoading;

  // =========================
  // ACTIVE LOGIC
  // =========================
  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  const currentMeta =
    pageMeta[pathname as keyof typeof pageMeta] || {
      title: "VT Zone",
      subtitle: "Personal ecosystem",
    };

  const title = currentMeta.title;
  const subtitle = currentMeta.subtitle;
  const currentPageHref = pathname || "/";

  // =========================
  // SAME PAGE / REFRESH LOGIC
  // =========================
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const isSamePage = pathname === href;
    const isCurrentBlog = pathname === "/blog" && href === "/blog";

    if (isCurrentBlog) {
      e.preventDefault();

      setOpen(false);
      setMoreOpen(false);
      setUserOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        window.dispatchEvent(new Event("refresh-blog-feed"));
      }, 250);

      return;
    }

    if (isSamePage) {
      e.preventDefault();

      setOpen(false);
      setMoreOpen(false);
      setUserOpen(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setOpen(false);
    setMoreOpen(false);
    setUserOpen(false);
  };

  // =========================
  // CLICK OUTSIDE
  // =========================
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }

      if (moreRef.current && !moreRef.current.contains(target)) {
        setMoreOpen(false);
      }

      if (userRef.current && !userRef.current.contains(target)) {
        setUserOpen(false);
      }
    }

    if (open || moreOpen || userOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, moreOpen, userOpen]);

  // =========================
  // LOCK BODY SCROLL WHEN MOBILE OPEN
  // =========================
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

  // =========================
  // ESC CLOSE
  // =========================
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMoreOpen(false);
        setUserOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // =========================
  // SCROLL STATE + AUTO HIDE / SHOW
  // =========================
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 18);

      if (open) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          if (currentScrollY < 120) {
            setVisible(true);
          } else if (diff > 5) {
            setVisible(false);
          } else if (diff < -5) {
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

  // =========================
  // QUICK ACTIONS
  // =========================
  const handleScrollTop = () => {
    setOpen(false);
    setMoreOpen(false);
    setUserOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRefreshCurrent = () => {
    setOpen(false);
    setMoreOpen(false);
    setUserOpen(false);

    if (pathname === "/blog") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setTimeout(() => {
        window.dispatchEvent(new Event("refresh-blog-feed"));
      }, 250);

      return;
    }

    router.refresh();
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return;
    }

    setOpen(false);
    setMoreOpen(false);
    setUserOpen(false);
    setProfile(null);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4 select-none">
        <div
          className={`
                topNavbar w-full transition-all duration-500
                ${scrolled ? "max-w-lg" : "max-w-3xl"}
              `}
        >
          {/* MAIN NAVBAR */}
          <div
            className={`
              relative overflow-visible rounded-full border transition-all duration-500 ease-out will-change-transform
              ${scrolled
                ? "border-white/50 bg-white/72 backdrop-blur-2xl shadow-[0_8px_48px_rgba(0,0,0,0.1)]"
                : "border-white/60 bg-white/58 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.015)]"
              }
              ${visible
                ? "translate-y-0 opacity-100"
                : "-translate-y-0 opacity-100" // thuộc tính CSS khi muốn ẩn Navbar thì sửa chỗ này!!
              }
            `}
          >
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/30 via-transparent to-white/15" />

            <div
              className={`
                relative flex items-center justify-between transition-all duration-300
                ${scrolled ? "px-1 py-1 ps-2" : "px-3.5 py-2.5 ps-3"}
              `}
            >
              {/* LOGO + TITLE */}
              <Link
                href={currentPageHref}
                onClick={(e) => handleNavClick(e, currentPageHref)}
                className="relative z-10 flex items-center gap-3 pl-1 min-w-0"
              >
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={40}
                  height={40}
                  className={`
                    pointer-events-none shrink-0 transition-all duration-300
                    ${scrolled ? "size-10" : "size-11"}
                  `}
                  priority
                />

                <div className="min-w-0 leading-tight">
                  <div
                    className={`
                      font-bold tracking-wide text-gray-800 transition-all duration-300 truncate
                      ${scrolled ? "text-lg" : "text-lg"}
                    `}
                  >
                    {title}
                  </div>
                  <div
                    className={` metaTitlePage_removeHiddenClasstoShow
                      hidden text-[11px] text-gray-500 transition-all duration-300 truncate
                      ${scrolled ? "opacity-80" : "opacity-100"}
                    `}
                  >
                    {subtitle}
                  </div>
                </div>
              </Link>

              {/* DESKTOP MENU */}
              <div className="relative z-10 hidden md:flex items-center gap-1">
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
                          ${active ? "text-white" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}
                        `}
                      >
                        {active && (
                          <motion.span
                            layoutId="active-nav-pill"
                            className="absolute inset-0 rounded-full bg-black shadow-lg"
                            transition={{
                              type: "spring",
                              stiffness: 380,
                              damping: 30,
                            }}
                          />
                        )}

                        <i
                          className={`${item.icon} relative z-10 text-base transition-transform duration-300 ${active ? "" : "group-hover:scale-105"
                            }`}
                        />
                        <span className="relative z-10">{item.name}</span>

                        {active && (
                          <span className="relative z-10 inline-block w-1.5 h-1.5 rounded-full bg-white/90" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* DESKTOP MORE */}
                <div className="relative" ref={moreRef}>
                  <button
                    onClick={() => {
                      setMoreOpen((prev) => !prev);
                      setUserOpen(false);
                    }}
                    className={`
                      cursor-pointer
                      group relative flex items-center gap-2 rounded-full px-4 py-2.5
                      text-sm font-medium active:scale-95 transition-all duration-300
                      ${moreMenu.some((item) => isActive(item.href))
                        ? "bg-gray-900 text-white shadow-lg"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                      }
                    `}
                    aria-label="Open more menu"
                    aria-expanded={moreOpen}
                  >
                    <i className="fa-duotone fa-grid-2 relative z-10 text-base transition-transform duration-300 group-hover:scale-105" />
                    <span className="relative z-10">More</span>
                    <i
                      className={`fa-duotone fa-chevron-down relative z-10 text-xs transition-transform duration-300 ${moreOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+14px)] w-72 rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)] p-3"
                      >
                        <div className="px-2 pb-2 pt-1">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                            Explore
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          {moreMenu.map((item) => {
                            const active = isActive(item.href);

                            return (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={(e) => handleNavClick(e, item.href)}
                                className={`
                                  flex items-center justify-between rounded-2xl px-4 py-3
                                  ${active
                                    ? "bg-gray-900 text-white shadow-sm"
                                    : "text-gray-700 hover:bg-gray-100 active:bg-gray-200 active:scale-97"
                                  }
                                `}
                              >
                                <div className="flex items-center gap-3">
                                  <i className={`${item.icon} text-base`} />
                                  <span className="text-sm font-medium">
                                    {item.name}
                                  </span>
                                </div>

                                {active ? (
                                  <span className="w-2 h-2 rounded-full bg-white/90" />
                                ) : (
                                  <i className="fa-duotone fa-arrow-up-right text-xs text-gray-400" />
                                )}
                              </Link>
                            );
                          })}
                        </div>

                        <div className="mt-3 border-t border-gray-200/70 pt-3 px-1 flex items-center gap-2">
                          <button
                            onClick={handleScrollTop}
                            className="flex-1 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-3 transition-all cursor-pointer"
                          >
                            <i className="fa-duotone fa-arrow-up" />
                          </button>
                          <button
                            onClick={handleRefreshCurrent}
                            className="flex-1 rounded-2xl bg-black text-white hover:opacity-90 text-sm font-medium px-4 py-3 transition-all cursor-pointer"
                          >
                            <i className="fa-duotone fa-arrows-rotate" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* DESKTOP USER - AVATAR ONLY */}
                <div className="relative ml-1" ref={userRef}>
                  <button
                    onClick={() => {
                      setUserOpen((prev) => !prev);
                      setMoreOpen(false);
                    }}
                    className="group relative flex items-center justify-center rounded-full p-[2px] transition-all duration-300"
                    aria-label="Open account menu"
                    aria-expanded={userOpen}
                  >
                    <div
                      className={`
                        rounded-full transition-all duration-300
                        ${user && role === "admin"
                          ? "isAdmin"
                          : "isNotAdmin"
                        }
                        ${userOpen ? "scale-105 shadow-lg" : "group-hover:scale-105"}
                      `}
                    >
                      <Image
                        src={avatar}
                        alt="avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover shadow-lg cursor-pointer"
                      />
                    </div>

                    {/* {authReady && user && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                    )}
                    */}
                  </button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="absolute right-0 top-[calc(100%+14px)] w-80 rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.14)] p-3"
                      >
                        {/* TOP PROFILE */}
                        <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
                          <Image
                            src={avatar}
                            alt="avatar"
                            width={52}
                            height={52}
                            className="w-[52px] h-[52px] rounded-full object-cover shadow-lg"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-base text-gray-900 flex items-center gap-1 truncate">
                              <span className="truncate">{fullName}</span>

                              {user && role === "admin" && (
                                <i
                                  className="fa-duotone fa-badge-check text-blue-500 text-xs shrink-0"
                                  title="Tài khoản đã xác thực"
                                />
                              )}
                            </p>

                            <p className="text-sm text-gray-600 truncate">
                              {user ? email : "Bạn chưa đăng nhập á!"}
                            </p>
                          </div>
                        </div>

                        {/* MENU */}
                        <div className="mt-3 flex flex-col gap-1.5">
                          {user && (
                            <Link
                              href="/profile"
                              onClick={() => {
                                setUserOpen(false);
                                setMoreOpen(false);
                              }}
                              className="flex items-center justify-between rounded-2xl px-4 py-3 text-gray-700 hover:bg-gray-100 active:bg-gray-200 active:scale-97"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-user text-base" />
                                <span className="text-sm font-medium">
                                  Chỉnh sửa Profile
                                </span>
                              </div>
                              <i className="fa-duotone fa-arrow-up-right text-xs text-gray-400" />
                            </Link>
                          )}

                          {user && role === "admin" && (
                            <button
                              onClick={() => {
                                setUserOpen(false);
                                setShowCreatePost(true);
                              }}
                              className="flex items-center justify-between rounded-2xl px-4 py-3 text-gray-700 hover:bg-gray-100 active:bg-gray-200 active:scale-97 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-pen-to-square text-base" />
                                <span className="text-sm font-medium">
                                  Đăng bài viết
                                </span>
                              </div>
                              <i className="fa-duotone fa-plus text-xs text-gray-400" />
                            </button>
                          )}

                          {!user ? (
                            <button
                              onClick={() => {
                                setUserOpen(false);
                                setShowLogin(true);
                              }}
                              className="flex items-center justify-between rounded-2xl px-4 py-3 text-gray-700 hover:bg-gray-100 active:bg-gray-200 active:scale-97 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-user-gear text-base" />
                                <span className="text-sm font-medium">
                                  Đăng nhập
                                </span>
                              </div>
                              <i className="fa-duotone fa-arrow-right text-xs text-gray-400" />
                            </button>
                          ) : (
                            <button
                              onClick={handleLogout}
                              className="flex items-center justify-between rounded-2xl px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 active:scale-97 cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-arrow-right-from-bracket text-base" />
                                <span className="text-sm font-medium">
                                  Đăng xuất
                                </span>
                              </div>
                              <i className="fa-duotone fa-arrow-right text-xs text-red-400" />
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
                onClick={() => setOpen(!open)}
                className="
                  relative z-10 md:hidden w-11 h-11 flex items-center justify-center rounded-full
                  border border-gray-100 bg-white/75 hover:bg-white shadow-sm
                  transition-all duration-300 text-gray-700 hover:text-black cursor-pointer
                "
                aria-label="Open menu"
                aria-expanded={open}
              >
                <i
                  className={`fa-duotone transition-all duration-300 ${open ? "fa-xmark text-[18px] rotate-90" : "fa-bars text-[18px]"
                    }`}
                />
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* OVERLAY */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/45 backdrop-blur-[3px]" />

                {/* SHEET */}
                <motion.div
                  ref={menuRef}
                  initial={{ y: 30, opacity: 0, scale: 0.98 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 20, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute left-1/2 top-5 -translate-x-1/2 w-[calc(100%-24px)] max-w-md rounded-[2rem] border border-white/60 bg-white/88 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-4"
                >
                  {/* MOBILE TOP */}
                  <div className="flex items-center justify-between mb-4 mt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src="/logo.png"
                        alt="logo"
                        width={38}
                        height={38}
                        className="pointer-events-none shrink-0"
                        priority
                      />
                      <div className="min-w-0">
                        <Link
                          href={currentPageHref}
                          onClick={(e) => handleNavClick(e, currentPageHref)}
                          className="font-semibold text-gray-900 leading-5 truncate block"
                        >
                          {title}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">
                          {subtitle}
                        </p>
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

                  {/* MOBILE ACCOUNT BLOCK */}
                  <div className="mb-4 rounded-3xl border border-white/60 bg-white/72 px-4 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Image
                        src={avatar}
                        alt="avatar"
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover shadow-md"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-base text-gray-900 flex items-center gap-1 truncate">
                          <span className="truncate">{fullName}</span>

                          {user && role === "admin" && (
                            <i
                              className="fa-duotone fa-badge-check text-blue-500 text-xs shrink-0"
                              title="Tài khoản đã xác thực"
                            />
                          )}
                        </p>

                        <p className="text-sm text-gray-600 truncate">
                          {user ? email : "Bạn chưa đăng nhập."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {user && (
                        <Link
                          href="/profile"
                          onClick={() => setOpen(false)}
                          className="rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-3.5 transition-all text-center"
                        >
                          <i className="fa-duotone fa-user mr-2" />
                          Cá nhân
                        </Link>
                      )}

                      {user && role === "admin" && (
                        <button
                          onClick={() => {
                            setOpen(false);
                            setShowCreatePost(true);
                          }}
                          className="rounded-2xl bg-black text-white hover:opacity-90 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer"
                        >
                          <i className="fa-duotone fa-pen-to-square mr-2" />
                          Đăng
                        </button>
                      )}

                      {!user && (
                        <button
                          onClick={() => {
                            setOpen(false);
                            setShowLogin(true);
                          }}
                          className="col-span-2 rounded-2xl bg-black text-white hover:opacity-90 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer"
                        >
                          <i className="fa-duotone fa-user-gear mr-2" />
                          Đăng nhập
                        </button>
                      )}

                      {user && (
                        <button
                          onClick={handleLogout}
                          className={`${role === "admin" ? "col-span-2" : "col-span-1"
                            } rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer`}
                        >
                          <i className="fa-duotone fa-arrow-right-from-bracket mr-2" />
                          Đăng xuất
                        </button>
                      )}
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

                              if (!(pathname === "/blog" && item.href === "/blog")) {
                                setOpen(false);
                              }
                            }}
                            className={`
                              rounded-3xl p-4 min-h-[96px]
                              flex flex-col justify-between
                              transition-all duration-300
                              ${active
                                ? "bg-gray-900 text-white shadow-lg"
                                : "bg-white/72 text-gray-700 hover:bg-white"
                              }
                            `}
                          >
                            <i className={`${item.icon} text-lg`} />

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold">
                                {item.name}
                              </span>

                              {active ? (
                                <span className="w-2 h-2 rounded-full bg-white/90 shrink-0" />
                              ) : (
                                <i className="fa-duotone fa-arrow-up-right text-xs opacity-60 shrink-0" />
                              )}
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={handleScrollTop}
                      className="rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer"
                    >
                      <i className="fa-duotone fa-arrow-up mr-2" />
                      Top
                    </button>

                    <button
                      onClick={handleRefreshCurrent}
                      className="rounded-2xl bg-black text-white hover:opacity-90 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer"
                    >
                      <i className="fa-duotone fa-rotate-right mr-2" />
                      Refresh
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* GLOBAL MODALS */}
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
    </>
  );
}