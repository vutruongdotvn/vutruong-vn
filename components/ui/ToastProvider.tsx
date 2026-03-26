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
  showToast: (message: string, type?: ToastType, duration?: number) => void;
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
      duration: number = 2600
    ) => {
      const id = Date.now() + Math.floor(Math.random() * 10000);

      setToasts((prev) => [...prev, { id, message, type, duration }]);

      timeoutRefs.current[id] = setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
        delete timeoutRefs.current[id];
      }, duration);
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
        "border-emerald-200/70 bg-white/85 text-emerald-800 shadow-emerald-100/60",
      progress: "bg-emerald-500",
      iconWrap: "bg-emerald-100 text-emerald-700",
      title: "Thành công",
    },
    error: {
      icon: "fa-duotone fa-circle-xmark",
      container:
        "border-red-200/70 bg-white/85 text-red-800 shadow-red-100/60",
      progress: "bg-red-500",
      iconWrap: "bg-red-100 text-red-700",
      title: "Có lỗi xảy ra",
    },
    info: {
      icon: "fa-duotone fa-circle-info",
      container:
        "border-sky-200/70 bg-white/85 text-sky-800 shadow-sky-100/60",
      progress: "bg-sky-500",
      iconWrap: "bg-sky-100 text-sky-700",
      title: "Thông báo",
    },
    warning: {
      icon: "fa-duotone fa-triangle-exclamation",
      container:
        "border-amber-200/70 bg-white/85 text-amber-800 shadow-amber-100/60",
      progress: "bg-amber-500",
      iconWrap: "bg-amber-100 text-amber-700",
      title: "Lưu ý",
    },
  };

  const current = styleMap[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border backdrop-blur-2xl shadow-2xl ${current.container}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.iconWrap}`}
        >
          <i className={`${current.icon} text-lg`} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5">{current.title}</p>
          <p className="mt-0.5 text-sm leading-5 text-black/75 break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="cursor-pointer rounded-full p-2 text-black/45 transition hover:bg-black/5 hover:text-black/70"
          aria-label="Đóng thông báo"
        >
          <i className="fa-regular fa-xmark" />
        </button>
      </div>

      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: 0 }}
        transition={{ duration: toast.duration / 1000, ease: "linear" }}
        className={`h-[3px] ${current.progress}`}
      />
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