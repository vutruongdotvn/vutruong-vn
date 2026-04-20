"use client";

import { useRef, useState } from "react";
import { useToastContext } from "@/components/ui/ToastProvider";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

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
    <section className="">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[2rem]">
        <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-sky-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-200/25 blur-3xl" />
      </div>

      <PremiumGlassCard className="p-0">
        {/* Header */}
        <div className="">

          <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
            Gửi biểu mẫu
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
            Mọi vấn đề cần liên hệ hoặc trao đổi, bạn có thể gửi biểu mẫu ngay
            tại đây. <br />
            Mình sẽ phản hồi trong thời gian sớm nhất có thể.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="group relative">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-1 transition group-focus-within:text-sky-600">
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
                  className="h-13 w-full rounded-2xl border border-white/50 bg-white/70 pl-12 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-gray-400 focus:border-sky-300 focus:bg-white/80 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Email */}
            <div className="group relative">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-1 transition group-focus-within:text-sky-600">
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
                  className="h-13 w-full rounded-2xl border border-white/50 bg-white/70 pl-12 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-gray-400 focus:border-sky-300 focus:bg-white/80 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="group relative">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-1 transition group-focus-within:text-sky-600">
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
                  className="h-13 w-full rounded-2xl border border-white/50 bg-white/70 pl-12 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-gray-400 focus:border-sky-300 focus:bg-white/80 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>

            {/* Facebook */}
            <div className="group relative">
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-1 transition group-focus-within:text-sky-600">
                  <i className="fa-brands fa-facebook" />
                </div>
                <input
                  type="text"
                  name="facebook"
                  autoComplete="off"
                  placeholder="Facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="h-13 w-full rounded-2xl border border-white/50 bg-white/70 pl-12 pr-4 text-sm text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-gray-400 focus:border-sky-300 focus:bg-white/80 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="group relative mt-5">
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-4 text-gray-400 z-1 transition group-focus-within:text-sky-600">
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
                className="w-full rounded-[1.75rem] border border-white/50 bg-white/70 pl-12 pr-4 pt-4 text-sm text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)] outline-none backdrop-blur-md transition duration-200 placeholder:text-gray-400 focus:border-sky-300 focus:bg-white/80 focus:ring-2 focus:ring-sky-100"
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
          <div className="mt-6 rounded-[1.75rem] border border-white/45 bg-white/45 p-4 backdrop-blur-xl sm:p-5">
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
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Xác nhận gửi <span className="text-red-500">*</span>
                  </span>
                </label>

                <p className="text-sm leading-6 text-gray-500">
                  Vui lòng kiểm tra kỹ thông tin trước khi gửi.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <button
                  type="button"
                  onClick={resetFormContact}
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/50 bg-white/75 px-5 text-sm font-bold uppercase tracking-wide text-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fa-duotone fa-rotate-left" />
                  Nhập lại
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-black px-6 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
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
      </PremiumGlassCard>
    </section>
  );
}