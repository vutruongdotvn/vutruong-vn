"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "./types";

type NavbarMobileMenuProps = {
  open: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  mobileMenu: MenuItem[];
  pathname: string;
  currentPageHref: string;
  title: string;
  subtitle: string;
  avatar: string;
  fullName: string;
  email: string;
  user: any;
  role: string | null;
  isActive: (href: string) => boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreatePost: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  onNavClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => void;
  onLogout: () => void;
  onScrollTop: () => void;
  onRefreshCurrent: () => void;
};

export default function NavbarMobileMenu({
  open,
  menuRef,
  mobileMenu,
  pathname,
  currentPageHref,
  title,
  subtitle,
  avatar,
  fullName,
  email,
  user,
  role,
  isActive,
  setOpen,
  setShowCreatePost,
  setShowLogin,
  onNavClick,
  onLogout,
  onScrollTop,
  onRefreshCurrent,
}: NavbarMobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/45 backdrop-blur-[2px]" />

          <motion.div
            ref={menuRef}
            initial={{ y: 0, opacity: 0, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 0, opacity: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute left-1/2 sm:top-5 -translate-x-1/2 w-full sm:w-[calc(100%-24px)] sm:max-w-md sm:rounded-4xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.18)] p-3"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={38}
                  height={38}
                  className="pointer-events-none shrink-0"
                  priority
                  unoptimized
                />
                <div className="min-w-0">
                  <Link
                    href={currentPageHref}
                    onClick={(e) => onNavClick(e, currentPageHref)}
                    className="text-lg font-semibold text-gray-900 leading-5 truncate block"
                  >
                    {title}
                  </Link>
                  <p className="text-xs text-gray-500 truncate hidden">{subtitle}</p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center text-gray-600 hover:text-black cursor-pointer"
                aria-label="Close menu"
              >
                <i className="fa-duotone fa-xmark" />
              </button>
            </div>

            <div className="mb-4 rounded-3xl bg-white px-4 py-4">
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
                    onClick={onLogout}
                    className={`${
                      role === "admin" ? "col-span-2" : "col-span-1"
                    } rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer`}
                  >
                    <i className="fa-duotone fa-arrow-right-from-bracket mr-2" />
                    Đăng xuất
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {mobileMenu.map((item, index) => {
                const active = isActive(item.href);

                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.15 + index * 0.05,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        onNavClick(e, item.href);

                        if (!(pathname === "/blog" && item.href === "/blog")) {
                          setOpen(false);
                        }
                      }}
                      className={`
                        rounded-2xl p-4
                        flex space-between gap-3
                        transition-all duration-300
                        ${
                          active
                            ? "bg-gray-900 text-white shadow-lg"
                            : "bg-white/72 text-gray-700 hover:bg-white"
                        }
                      `}
                    >
                      <i className={`${item.icon} text-lg`} />

                      <div className="flex items-center space-between gap-2">
                        <span className="text-sm font-semibold">{item.name}</span>

                        {active ? (
                          <span className="w-2 h-2 rounded-full bg-white/90 shrink-0" />
                        ) : (
                          <i className="fa-duotone fa-arrow-up-right text-xs opacity-0 shrink-0 hidden" />
                        )}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={onScrollTop}
                className="rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-3.5 transition-all cursor-pointer"
              >
                <i className="fa-duotone fa-arrow-up mr-2" />
                Top
              </button>

              <button
                onClick={onRefreshCurrent}
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
  );
}