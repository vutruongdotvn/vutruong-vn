"use client";

import { SecretItem } from "@/types/secret";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";

interface Props {
  secret: SecretItem;
  searchQuery: string;
  onEdit: (secret: SecretItem) => void;
}

export default function SecretCard({ secret, searchQuery, onEdit }: Props) {
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // State mở Modal Chi Tiết

  // 🛡️ Tự động ẩn mật khẩu sau 10 giây
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showPassword) timeout = setTimeout(() => setShowPassword(false), 10000);
    return () => clearTimeout(timeout);
  }, [showPassword]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showCode) timeout = setTimeout(() => setShowCode(false), 10000);
    return () => clearTimeout(timeout);
  }, [showCode]);

  const highlight = (text?: string) => {
    if (!text) return "";
    if (!searchQuery) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-black font-semibold rounded px-0.5">{part}</mark>
      ) : part
    );
  };

  const maskText = (text?: string, isVisible = false) => {
    if (!text) return "";
    if (isVisible) return text;
    if (text.length <= 3) return "•••";
    const first = text.charAt(0);
    const last = text.slice(-2);
    return `${first}••••••••${last}`;
  };

  const handleCopy = (text?: string, type?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast(`Đã copy ${type}`, "success");
  };

  const getBrandIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("facebook") || t.includes("fb")) return "fa-brands fa-facebook text-blue-600";
    if (t.includes("google") || t.includes("gmail") || t.includes("youtube")) return "fa-brands fa-google text-red-500";
    if (t.includes("apple") || t.includes("icloud") || t.includes("ios") || t.includes("mac")) return "fa-brands fa-apple text-black";
    if (t.includes("github")) return "fa-brands fa-github text-gray-800";
    if (t.includes("microsoft") || t.includes("windows")) return "fa-brands fa-windows text-blue-500";
    if (t.includes("tiktok")) return "fa-brands fa-tiktok text-black";
    if (t.includes("instagram") || t.includes("ig")) return "fa-brands fa-instagram text-pink-600";
    if (t.includes("zalo")) return "fa-solid fa-comment-dots text-blue-500";
    if (t.includes("supabase")) return "fa-solid fa-database text-emerald-500";
    if (t.includes("vercel")) return "fa-solid fa-triangle text-black";
    return "fa-duotone fa-shield-keyhole text-sky-500"; 
  };

  // Helper component hiển thị từng dòng thông tin
  const InfoRow = ({ label, icon, value, type, maskable, isMasked, setMask }: any) => {
    if (!value) return null;
    return (
      <div className="flex flex-col items-start group/item p-2 rounded-sm border border-2 border-gray-200 hover:border-gray-300 relative">
        <div className="text-gray-500 font-bold flex-shrink-0 text-xs uppercase tracking-wider flex items-center gap-1.5 absolute -top-2 left-0 bg-white mx-3 px-1">
          {label}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1 pt-1 mx-2">
          {/*<i className={`fa-duotone ${icon} absolute text-sm hidden`} />*/}
          <span 
            onClick={() => handleCopy(value, label)}
            className={`cursor-pointer transition truncate ${maskable ? 'passwordRow' : 'text-gray-800 hover:text-black'}`}
            title="Click để Copy"
          >
            {maskable ? maskText(value, isMasked) : highlight(value)}
          </span>
          {maskable && (
            <button 
              onClick={(e) => { e.stopPropagation(); setMask(!isMasked); }}
              className="w-6 h-6 cursor-pointer absolute right-2 text-gray-400 hover:text-gray-800 active:scale-95"
            >
              <i className={`fa-duotone ${isMasked ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 💳 THẺ HIỂN THỊ CHÍNH (CARD) */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-4 transition-all duration-300 hover:shadow-[0_8px_60px_rgba(0,0,0,0.1)] relative flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="size-13 flex flex-shrink-0 items-center justify-center bg-gray-100 rounded-2xl">
            <i className={`${getBrandIcon(secret.title)} text-2xl`} />
          </div>
          <div className="min-w-0 flex gap-0.25 flex-col">
            <h3 className="font-bold text-gray-800 text-base truncate">{highlight(secret.title)}</h3>
            {secret.tags && secret.tags.length > 0 && (
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
                {secret.tags.map(tag => (
                  <span key={tag} className="flex-shrink-0 text-xs opacity-75">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4 Thông tin cơ bản */}
        <div className="space-y-4 text-sm sm:text-base flex-1">
          <InfoRow label="Tài khoản" icon="fa-user" value={secret.account} />
          <InfoRow label="Mật khẩu" icon="fa-key-skeleton" value={secret.password} maskable isMasked={showPassword} setMask={setShowPassword} />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-center absolute top-0 right-0 m-4 gap-1">
          <button 
            onClick={() => setIsViewModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 active:scale-95 text-sm font-medium p-3 rounded-lg cursor-pointer w-full"
          >
            <i className="fa-duotone fa-expand" />
          </button>
          <button 
            onClick={() => onEdit(secret)}
            className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 active:scale-95 text-sm font-medium p-3 rounded-lg cursor-pointer w-full"
            title="Chỉnh sửa"
          >
            <i className="fa-duotone fa-pen"/>
          </button>
        </div>
      </div>

      {/* 🔍 MODAL XEM CHI TIẾT (VIEW FULL) */}
      {isViewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-xs transition-opacity" onClick={() => setIsViewModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn">
            
            <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl">
                  <i className={`${getBrandIcon(secret.title)} text-xl`} />
                 </div>
                 <div>
                   <h2 className="text-lg font-bold text-gray-900 leading-tight">{secret.title}</h2>
                 </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer active:scale-95">
                <i className="fa-duotone fa-xmark text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar bg-white text-sm sm:text-base">
               {/* Gọi lại InfoRow cho tất cả các trường (nếu có dữ liệu) */}
               <InfoRow label="Tài khoản" icon="fa-user" value={secret.account} />
               <InfoRow label="Mật khẩu" icon="fa-key-skeleton" value={secret.password} maskable isMasked={showPassword} setMask={setShowPassword} />
               <InfoRow label="Địa chỉ Email" icon="fa-envelope" value={secret.email} />
               <InfoRow label="Số điện thoại" icon="fa-phone" value={secret.phone} />
               
               {/*(secret.recovery_email || secret.recovery_phone || secret.secret_code) && (
                 <div className="my-4 border-t border-gray-100 pt-4" /> // đường kẻ ngang phân tách giữa các data backup (email, sđt)
               )*/}
               
               <InfoRow label="Email khôi phục" icon="fa-envelope-open-text" value={secret.recovery_email} />
               <InfoRow label="SĐT khôi phục" icon="fa-phone-plus" value={secret.recovery_phone} />
               <InfoRow label="Mã bí mật / PIN / 2FA" icon="fa-qrcode" value={secret.secret_code} maskable isMasked={showCode} setMask={setShowCode} />

               {secret.notes && (
                 <>
                   <div className="notes_info">
                     <div className="bg-amber-50/50 border border-amber-200 text-amber-900 text-sm p-4 rounded-md whitespace-pre-wrap break-words leading-relaxed mt-4">
                     <div className="font-bold">Ghi chú</div>
                      <div className="my-3 border-t border-amber-200" />
                       {secret.notes}
                     </div>
                   </div>
                 </>
               )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end bg-white">
               <button onClick={() => { setIsViewModalOpen(false); onEdit(secret); }} className="px-5 py-2.5 bg-sky-100 text-sky-700 hover:bg-sky-200 text-sm font-semibold rounded-xl transition cursor-pointer flex items-center gap-2">
                 <i className="fa-duotone fa-pen-to-square" /> Chỉnh sửa
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}