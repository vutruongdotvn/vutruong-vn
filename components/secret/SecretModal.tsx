"use client";

import { useState, useEffect } from "react";
import { SecretItem } from "@/types/secret";
import { createSecret, updateSecret, deleteSecret } from "@/services/secretService";
import { useToast } from "@/hooks/useToast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem?: SecretItem | null;
}

export default function SecretModal({ isOpen, onClose, onSuccess, editingItem }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<SecretItem>>({
    title: "", account: "", password: "", email: "", recovery_email: "", phone: "", recovery_phone: "", secret_code: "", tags: [], notes: ""
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isOpen && editingItem) {
      setFormData(editingItem);
    } else {
      setFormData({ title: "", account: "", password: "", email: "", recovery_email: "", phone: "", recovery_phone: "", secret_code: "", tags: [], notes: "" });
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/#/g, "");
      if (!formData.tags?.includes(newTag)) {
        setFormData({ ...formData, tags: [...(formData.tags || []), newTag] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async () => {
    if (!formData.title?.trim()) {
      showToast("Tên dịch vụ không được để trống", "warning");
      return;
    }
    setLoading(true);
    const res = editingItem?.id 
      ? await updateSecret(editingItem.id, formData) 
      : await createSecret(formData);
    
    setLoading(false);
    if (res.success) {
      showToast(editingItem ? "Đã cập nhật tài khoản" : "Đã lưu tài khoản mới", "success");
      onSuccess();
    } else {
      showToast("Có lỗi xảy ra khi lưu", "error");
    }
  };

  const handleDelete = async () => {
    if (!editingItem?.id || !confirm("Xóa vĩnh viễn tài khoản này? Không thể khôi phục!")) return;
    setLoading(true);
    const res = await deleteSecret(editingItem.id);
    setLoading(false);
    if (res.success) {
      showToast("Đã xóa tài khoản", "success");
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-full animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <i className={`fa-duotone ${editingItem ? 'fa-pen-to-square' : 'fa-shield-plus'} text-lg`} />
            </div>
            {editingItem ? "Chỉnh sửa tài khoản" : "Thêm tài khoản bảo mật"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer active:scale-95">
            <i className="fa-duotone fa-xmark text-xl" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          {/* Brand */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              <i className="fa-duotone fa-building" /> Tên Brand / Dịch vụ *
            </label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="VD: Google, Facebook, VNeID..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:bg-white focus:border-sky-500 outline-none transition shadow-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Cột 1 */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-user" /> Tài khoản (Username)</label>
                <input name="account" value={formData.account || ""} onChange={handleChange} placeholder="Nhập username..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-sky-500 outline-none transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-envelope" /> Email đăng nhập</label>
                <input name="email" value={formData.email || ""} onChange={handleChange} placeholder="Nhập email..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-sky-500 outline-none transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-phone" /> Số điện thoại</label>
                <input name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="Nhập số điện thoại..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-sky-500 outline-none transition" />
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-key-skeleton" /> Mật khẩu</label>
                <input name="password" type="text" value={formData.password || ""} onChange={handleChange} placeholder="Nhập mật khẩu..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:bg-white focus:border-sky-500 outline-none transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-envelope-open-text text-orange-500" /> Email khôi phục</label>
                <input name="recovery_email" value={formData.recovery_email || ""} onChange={handleChange} placeholder="Email backup..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-sky-500 outline-none transition" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-phone-plus text-orange-500" /> SĐT khôi phục</label>
                <input name="recovery_phone" value={formData.recovery_phone || ""} onChange={handleChange} placeholder="SĐT backup..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-sky-500 outline-none transition" />
              </div>
            </div>
          </div>

          {/* Mật mã & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-qrcode text-red-500" /> Mã bí mật / PIN / 2FA</label>
              <input name="secret_code" value={formData.secret_code || ""} onChange={handleChange} placeholder="Mã PIN, mã bảo mật..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:bg-white focus:border-sky-500 outline-none transition" />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-tags text-sky-500" /> Phân loại (Tags)</label>
              <div className="flex items-center gap-2 flex-wrap bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2 min-h-[42px] focus-within:bg-white focus-within:border-sky-500 transition">
                {formData.tags?.map(tag => (
                  <span key={tag} className="bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm">
                    <span className="text-sky-500">#</span>{tag} 
                    <i onClick={() => removeTag(tag)} className="fa-solid fa-xmark cursor-pointer hover:text-red-500 transition-colors" />
                  </span>
                ))}
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder={formData.tags?.length ? "Thêm..." : "Nhấn Enter để thêm tag"} className="bg-transparent text-sm outline-none flex-1 min-w-[100px] placeholder:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
             <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5"><i className="fa-duotone fa-clipboard-list" /> Ghi chú khác</label>
             <textarea name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} placeholder="Viết ghi chú bổ sung tại đây..." className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-sky-500 outline-none transition resize-none" />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          {editingItem ? (
             <button onClick={handleDelete} disabled={loading} className="text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer active:scale-95">
               <i className="fa-duotone fa-trash-can" /> Xóa
             </button>
          ) : <div/>}
          
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer active:scale-95">Hủy</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl shadow-[0_4px_12px_rgba(2,132,199,0.2)] transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2">
              {loading ? <i className="fa-duotone fa-spinner-third fa-spin" /> : <i className="fa-duotone fa-floppy-disk" />}
              {loading ? "Đang xử lý..." : "Lưu dữ liệu"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}