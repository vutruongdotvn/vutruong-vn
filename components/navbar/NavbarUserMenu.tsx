"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type NavbarUserMenuProps = {
  userRef: React.RefObject<HTMLDivElement | null>;
  userOpen: boolean;
  setUserOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMoreOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCreatePost: React.Dispatch<React.SetStateAction<boolean>>;
  setShowLogin: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  role: string | null;
  avatar: string;
  fullName: string;
  email: string;
  onLogout: () => void;
};

export default function NavbarUserMenu({
  userRef,
  userOpen,
  setUserOpen,
  setMoreOpen,
  setShowCreatePost,
  setShowLogin,
  user,
  role,
  avatar,
  fullName,
  email,
  onLogout,
}: NavbarUserMenuProps) {
  return (
    <div className="relative avatarWrap" ref={userRef}>
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
            ${user && role === "admin" ? "isAdmin" : "isUser"}
            ${userOpen ? "scale-105 shadow-lg" : "group-hover:scale-105"}
          `}
        >
          <Image
            src={avatar}
            alt="avatar"
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover cursor-pointer"
          />
        </div>
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
            <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
              <Image
                src={avatar}
                alt="avatar"
                width={52}
                height={52}
                unoptimized
                className="w-[52px] h-[52px] rounded-full object-cover shadow-lg pointer-events-none"
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
                  {user ? email : "Bạn chưa đăng nhập"}
                </p>
              </div>
            </div>

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
                    <span className="text-sm font-medium">Chỉnh sửa Profile</span>
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
                    <span className="text-sm font-medium">Đăng bài viết</span>
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
                    <span className="text-sm font-medium">Đăng nhập</span>
                  </div>
                  <i className="fa-duotone fa-arrow-right text-xs text-gray-400" />
                </button>
              ) : (
                <button
                  onClick={onLogout}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-red-600 hover:bg-red-50 active:bg-red-100 active:scale-97 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-duotone fa-arrow-right-from-bracket text-base" />
                    <span className="text-sm font-medium">Đăng xuất</span>
                  </div>
                  <i className="fa-duotone fa-arrow-right text-xs text-red-400" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}