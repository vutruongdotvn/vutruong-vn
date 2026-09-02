"use client";

import { useRef, useState } from "react";
import { useToastContext } from "@/components/ui/ToastProvider";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdlRS2GhB5GOIUFIDwUoMN1vSN6xJvqnrtoBSGjlGCZwHUByQ/formResponse";

const SPAM_WORDS = [
  "yandex",
  "wallet",
  "transfer",
  "crypto",
  "bitcoin",
  "usdt",
  "trx",
  "get free",
  "e-wallet",
  "airdrop",
  "ho và tên",
];

type FormDataType = {
  name: string;
  email: string;
  phone: string;
  facebook: string;
  message: string;
  honeypot: string;
  humanCheck: boolean;
};

export default function ContactForm() {
  const { showToast, removeToast } = useToastContext();

  const formLoadTimeRef = useRef<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    phone: "",
    facebook: "",
    message: "",
    honeypot: "",
    humanCheck: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/[^\d+]/g, "") : value,
    }));
  };

  const resetFormWithoutToast = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      facebook: "",
      message: "",
      honeypot: "",
      humanCheck: false,
    });
  };

  const resetFormContact = () => {
    resetFormWithoutToast();
    showToast("Đã xóa toàn bộ biểu mẫu.", "info");
  };

  const validateSpam = () => {
    if (formData.honeypot.trim() !== "") {
      showToast("Nội dung không hợp lệ!", "error");
      return false;
    }

    if (Date.now() - formLoadTimeRef.current < 4500) {
      showToast("Vui lòng chờ ít nhất 5 giây trước khi gửi.", "warning");
      return false;
    }

    const msg = formData.message.toLowerCase().trim();
    if (SPAM_WORDS.some((word) => msg.includes(word))) {
      showToast("Phát hiện spam: nội dung chứa từ cấm!", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validateSpam()) return;

    setIsSubmitting(true);

    const loadingToastId = showToast(
      "Đang gửi biểu mẫu, vui lòng đợi...",
      "info",
      0
    );

    try {
      const payload = new FormData();
      payload.append("entry.415261244", formData.name);
      payload.append("entry.1326429705", formData.email);
      payload.append("entry.387237710", formData.phone);
      payload.append("entry.2058507669", formData.facebook);
      payload.append("entry.959671362", formData.message);

      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: payload,
      });

      removeToast(loadingToastId);
      resetFormWithoutToast();

      showToast(
        "Đã gửi thành công!",
        "success",
        5000
      );
    } catch (error) {
      console.error("Contact submit error:", error);
      removeToast(loadingToastId);
      showToast(
        "Có lỗi xảy ra khi gửi biểu mẫu. Vui lòng thử lại.",
        "error",
        4500
      );
    } finally {
      setIsSubmitting(false);
      formLoadTimeRef.current = Date.now();
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div>

        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          Liên hệ
        </h2>

        <p className="text-muted-foreground text-sm mt-1">
          Mọi vấn đề cần liên hệ, trao đổi, cộng tác,
          hãy gửi thông tin qua biểu mẫu liên hệ. 
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="py-6">
        <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2">
          {/* Name */}
          <div className="group relative">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-1 transition group-focus-within:text-sky-600">
                <i className="fa-duotone fa-user" />
              </div>
              <input
                type="text"
                name="name"
                required
                autoComplete="off"
                placeholder="Họ và Tên"
                value={formData.name}
                onChange={handleChange}
                className="h-12 w-full rounded-lg pl-12 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground border border-border focus:border-border"
              />
            </div>
          </div>

          {/* Email */}
          <div className="group relative">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-1 transition group-focus-within:text-sky-600">
                <i className="fa-duotone fa-envelope" />
              </div>
              <input
                type="email"
                name="email"
                required
                autoComplete="off"
                placeholder="Địa chỉ Email"
                value={formData.email}
                onChange={handleChange}
                pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                className="h-12 w-full rounded-lg pl-12 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground border border-border focus:border-border"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="group relative">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-1 transition group-focus-within:text-sky-600">
                <i className="fa-duotone fa-phone" />
              </div>
              <input
                type="tel"
                name="phone"
                required
                autoComplete="off"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                pattern="(\+84|0)\d{9,10}"
                className="h-12 w-full rounded-lg pl-12 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground border border-border focus:border-border"
              />
            </div>
          </div>

          {/* Facebook */}
          <div className="group relative">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-1 transition group-focus-within:text-sky-600">
                <i className="fa-brands fa-facebook" />
              </div>
              <input
                type="text"
                name="facebook"
                autoComplete="off"
                placeholder="Facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="h-12 w-full rounded-lg pl-12 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground border border-border focus:border-border"
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="group relative mt-2 sm:mt-4">
          <div className="relative">
            <div className="pointer-events-none absolute left-4 top-4 text-muted-foreground z-1 transition group-focus-within:text-sky-600">
              <i className="fa-duotone fa-comment-alt" />
            </div>
            <textarea
              name="message"
              required
              autoComplete="off"
              placeholder="Nội dung"
              rows={7}
              value={formData.message}
              onChange={handleChange}
              className="w-full rounded-lg pl-12 pr-4 pt-4 text-sm text-foreground outline-none border border-border focus:border-border"
            />
          </div>
        </div>

        {/* Honeypot */}
        <div className="absolute -left-[9999px] -top-[9999px] -z-10">
          <input
            type="text"
            name="honeypot"
            autoComplete="off"
            tabIndex={-1}
            value={formData.honeypot}
            onChange={handleChange}
          />
        </div>

        {/* Footer */}
        <div className="mt-2 sm:mt-4">
          <div className="space-y-4">
            {/* Checkbox + helper */}
            <div className="space-y-3">
              <label
                htmlFor="humanCheck"
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  id="humanCheck"
                  name="humanCheck"
                  type="checkbox"
                  required
                  checked={formData.humanCheck}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded border-border text-sky-600 dark:text-sky-300 focus:ring-sky-500"
                />
                <span className="text-sm font-medium text-foreground/75">
                  Xác nhận gửi <span className="text-red-500">*</span>
                </span>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <button
                type="button"
                onClick={resetFormContact}
                disabled={isSubmitting}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-muted hover:bg-secondary rounded-full text-sm font-medium active:scale-98 transition"
              >
                <i className="fa-duotone fa-rotate-left" />
                Nhập lại
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 bg-primary hover:bg-primary/90 rounded-full text-sm text-primary-foreground font-medium active:scale-98 transition"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-duotone fa-spinner-third fa-spin" />
                    Đang gửi
                  </>
                ) : (
                  <>
                    <i className="fa-duotone fa-paper-plane-top" />
                    Gửi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
