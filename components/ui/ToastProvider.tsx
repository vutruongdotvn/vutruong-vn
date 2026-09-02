"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => number;
  removeToast: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutRefs = useRef<Record<number, NodeJS.Timeout>>({});

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "success",
      duration: number = 5000
    ) => {
      const id = Date.now() + Math.floor(Math.random() * 10000);

      setToasts((prev) => [...prev, { id, message, type, duration }]);

      // duration <= 0 => toast sẽ không tự đóng
      if (duration > 0) {
        timeoutRefs.current[id] = setTimeout(() => {
          setToasts((prev) => prev.filter((toast) => toast.id !== id));
          delete timeoutRefs.current[id];
        }, duration);
      }

      return id;
    },
    []
  );

  const value = useMemo(
    () => ({
      showToast,
      removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex w-full max-w-[420px] flex-col gap-3 px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <PremiumToast
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function PremiumToast({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  const styleMap = {
    success: {
      icon: "fa-duotone fa-circle-check",
      container:
        "border-emerald-200/70 bg-card/85 text-emerald-800 dark:border-emerald-400/25 dark:text-emerald-300 dark:shadow-none shadow-emerald-100/60",
      progress: "bg-emerald-500",
      iconWrap: "bg-emerald-100 dark:bg-emerald-400/15 text-emerald-700 dark:text-emerald-300",
      // title: "Thành công",
    },
    error: {
      icon: "fa-duotone fa-circle-xmark",
      container:
        "border-red-200/70 bg-card/85 text-red-800 dark:border-red-400/25 dark:text-red-300 dark:shadow-none shadow-red-100/60",
      progress: "bg-red-500",
      iconWrap: "bg-red-100 dark:bg-red-400/15 text-red-700 dark:text-red-300",
      // title: "Có lỗi xảy ra",
    },
    info: {
      icon: "fa-duotone fa-circle-info",
      container:
        "border-sky-200/70 bg-card/85 text-sky-800 dark:border-sky-400/25 dark:text-sky-300 dark:shadow-none shadow-sky-100/60",
      progress: "bg-sky-500",
      iconWrap: "bg-sky-100 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300",
      // title: "Thông báo",
    },
    warning: {
      icon: "fa-duotone fa-exclamation",
      container:
        "border-amber-200/70 bg-card/85 text-amber-800 dark:border-amber-400/25 dark:text-amber-300 dark:shadow-none shadow-amber-100/60",
      progress: "bg-amber-500",
      iconWrap: "bg-amber-100 dark:bg-amber-400/15 text-amber-700 dark:text-amber-300",
      // title: "Lưu ý",
    },
  };

  const current = styleMap[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 0, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border backdrop-blur-2xl shadow-2xl ${current.container}`}
    >
      <div className="flex items-center gap-3 p-4">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.iconWrap}`}
        >
          <i className={`${current.icon} text-lg`} />
        </div>

        <div className="min-w-0 flex-1">
          {/*<p className="text-sm font-semibold leading-5">{current.title}</p>*/}
          <p className="break-words text-sm leading-6 text-foreground/75">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="cursor-pointer rounded-full p-2 text-foreground/45 transition hover:bg-foreground/5 hover:text-foreground/70"
          aria-label="Đóng thông báo"
        >
          <i className="fa-regular fa-xmark" />
        </button>
      </div>

      {toast.duration > 0 && (
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: 0 }}
          transition={{ duration: toast.duration / 1000, ease: "linear" }}
          className={`h-[3px] ${current.progress}`}
        />
      )}
    </motion.div>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToastContext must be used inside ToastProvider");
  }

  return context;
}
