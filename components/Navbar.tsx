"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getAvatarImage } from "@/lib/cloudinary";

import CreatePostModal from "@/components/blog/CreatePostModal";
import LoginModal from "@/components/auth/LoginModal";

import NavbarBrand from "@/components/navbar/NavbarBrand";
import NavbarDesktopMenu from "@/components/navbar/NavbarDesktopMenu";
import NavbarMoreMenu from "@/components/navbar/NavbarMoreMenu";
import NavbarUserMenu from "@/components/navbar/NavbarUserMenu";
import NavbarMobileToggle from "@/components/navbar/NavbarMobileToggle";
import NavbarMobileMenu from "@/components/navbar/NavbarMobileMenu";

import {
  mainMenu,
  moreMenu,
  mobileMenu,
  pageMeta,
} from "@/components/navbar/constants";

type ProfileData = {
  name?: string | null;
  avatar?: string | null;
} | null;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // =========================
  // UI STATE
  // =========================
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // =========================
  // AUTH / PROFILE STATE
  // =========================
  const { user, role, loading: userLoading } = useUser();

  const [profile, setProfile] = useState<ProfileData>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // =========================
  // REFS
  // =========================
  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const lastFetchedUserId = useRef<string | null>(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // =========================
  // HELPERS
  // =========================
  const closeAllMenus = useCallback(() => {
    setOpen(false);
    setMoreOpen(false);
    setUserOpen(false);
  }, []);

  useEffect(() => {
    const handleMobileToggle = () => {
      setOpen((prev) => !prev);
    };

    window.addEventListener("navbar-mobile-toggle", handleMobileToggle);

    return () => {
      window.removeEventListener("navbar-mobile-toggle", handleMobileToggle);
    };
  }, []);


  const isActive = useCallback(
    (href: string) => {
      return href === "/" ? pathname === "/" : pathname.startsWith(href);
    },
    [pathname]
  );

  const currentMeta =
    pathname === "/blog" || pathname.startsWith("/blog/")
      ? pageMeta["/blog"]
      : pageMeta[pathname as keyof typeof pageMeta] || {
          title: "VT Zone",
          subtitle: "Personal ecosystem",
        };

  const title = currentMeta.title;
  const subtitle = currentMeta.subtitle;
  const currentPageHref = pathname || "/";

  // =========================
  // PROFILE FETCH
  // =========================
  const fetchProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (error) {
        console.error("Navbar fetchProfile error:", error);
        setProfile(null);
        return;
      }

      setProfile((data as ProfileData) || null);
    } catch (err) {
      console.error("Navbar fetchProfile crash:", err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

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
    fetchProfile(user);
  }, [user, userLoading, fetchProfile]);

  // =========================
  // DERIVED AUTH UI DATA
  // =========================
  const fullName = user ? profile?.name || "User" : "Xin chào! 👋";
  const email = user?.email || "";
  const avatar = user
    ? getAvatarImage(profile?.avatar || "") || "/images/default.jpg"
    : "/images/default.jpg";

  const authReady = !userLoading && !profileLoading;

  // =========================
  // SAME PAGE / REFRESH LOGIC
  // =========================
  const handleSamePageNav = useCallback(
    (href: string) => {
      const isSamePage = pathname === href;
      const isCurrentBlog = pathname === "/blog" && href === "/blog";

      if (!isSamePage) return false;

      closeAllMenus();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      if (isCurrentBlog) {
        setTimeout(() => {
          window.dispatchEvent(new Event("refresh-blog-feed"));
        }, 250);
      }

      return true;
    },
    [pathname, closeAllMenus]
  );

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (handleSamePageNav(href)) {
        e.preventDefault();
        return;
      }

      closeAllMenus();
    },
    [handleSamePageNav, closeAllMenus]
  );

  // =========================
  // LIQUID MENU NAV BRIDGE
  // =========================
  useEffect(() => {
    const handleLiquidMenuNav = (event: Event) => {
      const { href } = (
        event as CustomEvent<{ href: string }>
      ).detail;

      handleSamePageNav(href);
    };

    window.addEventListener(
      "navbar-handle-nav-click",
      handleLiquidMenuNav
    );

    return () => {
      window.removeEventListener(
        "navbar-handle-nav-click",
        handleLiquidMenuNav
      );
    };
  }, [handleSamePageNav]);

  // =========================
  // CLICK OUTSIDE
  // =========================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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
    };

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
        closeAllMenus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeAllMenus]);

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
  const handleScrollTop = useCallback(() => {
    closeAllMenus();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [closeAllMenus]);

  const handleRefreshCurrent = useCallback(() => {
    closeAllMenus();

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
  }, [pathname, router, closeAllMenus]);

  // =========================
  // AUTH ACTIONS
  // =========================
  const handleLogout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error);
      return;
    }

    closeAllMenus();
    setProfile(null);
    lastFetchedUserId.current = null;
  }, [closeAllMenus]);

  return (
    <>
      <header className="fixed top-0 left-0 z-50 flex w-full select-none justify-center">
        <div
          className={`
            topNavbar w-full transition-all duration-1500 ease-in-out rounded-0
            ${scrolled ? "max-w-full-scrolled" : "max-w-full"}
          `}
        >
          <div
            className={`
              relative overflow-visible border transition-all duration-900 ease-in-out hover:bg-white
              ${scrolled
                ? "border-white/30 bg-white backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
                : "border-white/60 bg-white shadow-[0_12px_24px_rgba(0,0,0,0.01)]"
              }
              ${visible
                ? "translate-y-0 opacity-100"
                : "-translate-y-0 opacity-100"
              }
            `}
          >
            <div
              className={`
                relative flex items-center justify-between transition-all duration-600 max-w-6xl mx-auto p-1.5
              `}
            >
              <NavbarBrand
                currentPageHref={currentPageHref}
                title={title}
                subtitle={subtitle}
                scrolled={scrolled}
                onNavClick={handleNavClick}
              />

              <div className="relative z-10 hidden items-center gap-1 md:flex">
                <NavbarDesktopMenu
                  mainMenu={mainMenu}
                  isActive={isActive}
                  onNavClick={handleNavClick}
                />

                <NavbarMoreMenu
                  moreRef={moreRef}
                  moreOpen={moreOpen}
                  setMoreOpen={setMoreOpen}
                  setUserOpen={setUserOpen}
                  moreMenu={moreMenu}
                  isActive={isActive}
                  onNavClick={handleNavClick}
                  onScrollTop={handleScrollTop}
                  onRefreshCurrent={handleRefreshCurrent}
                />

                <NavbarUserMenu
                  userRef={userRef}
                  userOpen={userOpen}
                  setUserOpen={setUserOpen}
                  setMoreOpen={setMoreOpen}
                  setShowCreatePost={setShowCreatePost}
                  setShowLogin={setShowLogin}
                  user={authReady ? user : null}
                  role={authReady ? role : null}
                  avatar={avatar}
                  fullName={fullName}
                  email={email}
                  onLogout={handleLogout}
                />
              </div>

              <NavbarMobileToggle
                open={open}
                onToggle={() => setOpen((prev) => !prev)}
              />
            </div>
          </div>

          <NavbarMobileMenu
            open={open}
            menuRef={menuRef}
            mobileMenu={mobileMenu}
            pathname={pathname}
            currentPageHref={currentPageHref}
            title={title}
            subtitle={subtitle}
            avatar={avatar}
            fullName={fullName}
            email={email}
            user={authReady ? user : null}
            role={authReady ? role : null}
            isActive={isActive}
            setOpen={setOpen}
            setShowCreatePost={setShowCreatePost}
            setShowLogin={setShowLogin}
            onNavClick={handleNavClick}
            onLogout={handleLogout}
            onScrollTop={handleScrollTop}
            onRefreshCurrent={handleRefreshCurrent}
          />
        </div>
      </header>

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