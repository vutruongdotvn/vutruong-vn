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

const DEFAULT_FORM_STATE: Partial<SecretItem> = { 
  title: "", account: "", password: "", email: "", recovery_email: "", phone: "", recovery_phone: "", secret_code: "", tags: [], notes: "" 
};

export default function SecretModal({ isOpen, onClose, onSuccess, editingItem }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<SecretItem>>(DEFAULT_FORM_STATE);
  
  // 🚀 Lưu lại data gốc khi vừa mở form để so sánh
  const [initialData, setInitialData] = useState<Partial<SecretItem>>(DEFAULT_FORM_STATE);
  
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      const dataToLoad = editingItem ? { ...DEFAULT_FORM_STATE, ...editingItem } : DEFAULT_FORM_STATE;
      setFormData(dataToLoad);
      setInitialData(dataToLoad);
      setTagInput("");
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  // 🚀 Biến kiểm tra xem user có thay đổi gì chưa (so sánh JSON string cho nhanh & chính xác)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  // 🚀 Hàm xử lý khi ấn nút Thoát (Bắt cảnh báo nếu có thay đổi)
  const handleClose = () => {
    if (hasChanges) {
      if (window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn hủy bỏ?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

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
      {/* 🚀 Thay onClose thành handleClose ở Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-xs transition-opacity" onClick={handleClose} />
      <div className="relative w-full max-w-3xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-full animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2.5 text-sky-600">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
              <i className={`fa-duotone ${editingItem ? 'fa-pen-to-square' : 'fa-shield-plus'} text-lg`} />
            </div>
            {editingItem ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
          </h2>
          {/* 🚀 Thay onClose thành handleClose ở nút X */}
          <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer active:scale-95">
            <i className="fa-duotone fa-xmark text-xl" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">

          {/* Brand */}
          <div className="relative">
            <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Tên Brand / Dịch vụ *
            </label>
            <input autoComplete="off" name="title" value={formData.title} onChange={handleChange} placeholder="VD: Google, Facebook, VNeID..."
              className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cột 1 */}
            <div className="space-y-4">
              <div className="relative">
                <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tài khoản (Username)</label>
                <input autoComplete="off" name="account" value={formData.account || ""} onChange={handleChange} placeholder="Tên đăng nhập"
                  className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
              </div>
              <div className="relative">
                <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email đăng nhập</label>
                <input autoComplete="off" name="email" value={formData.email || ""} onChange={handleChange} placeholder="Địa chỉ Email" className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
              </div>
              <div className="relative">
                <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Số điện thoại</label>
                <input autoComplete="off" name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="Số điện thoại" className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
              </div>
            </div>

            {/* Cột 2 */}
            <div className="space-y-4">
              <div className="relative">
                <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu</label>
                <input autoComplete="off" name="password" type="text" value={formData.password || ""} onChange={handleChange} placeholder="Nhập mật khẩu..." className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
              </div>
              <div className="relative">
                <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email khôi phục</label>
                <input autoComplete="off" name="recovery_email" value={formData.recovery_email || ""} onChange={handleChange} placeholder="Email backup..." className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
              </div>
              <div className="relative">
                <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">SĐT khôi phục</label>
                <input autoComplete="off" name="recovery_phone" value={formData.recovery_phone || ""} onChange={handleChange} placeholder="SĐT backup..." className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Mật mã & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative">
              <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Mã bí mật / PIN / 2FA</label>
              <input autoComplete="off" name="secret_code" value={formData.secret_code || ""} onChange={handleChange} placeholder="Mã PIN, mã bảo mật..." className="w-full p-4 border border-2 border-gray-200 rounded-md outline-sky-500 transition-colors" />
            </div>
            <div className="relative">
              <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Phân loại (Tags)</label>
              <div className="w-full p-4 border border-2 border-gray-200 rounded-md focus-within:border-sky-500 transition-colors">
                {formData.tags?.map(tag => (
                  <span onClick={() => removeTag(tag)} key={tag}
                    className="text-sky-600 hover:opacity-80 active:scale-95
                    inline-flex items-center gap-0 cursor-pointer select-none mr-1" title="Click để xóa tag">
                    <span>#</span><span>{tag}</span>
                  </span>
                ))}
                <input autoComplete="off" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder={formData.tags?.length ? "Thêm tag" : "Thêm tag"} className="w-[max-content] outline-0" />
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="relative">
            <label className="absolute -top-1.5 left-0 mx-2 px-2 bg-white flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ghi chú khác</label>
            <textarea name="notes" value={formData.notes || ""} onChange={handleChange} rows={3} placeholder="Ghi chú cho tài khoản" className="w-full border border-2 border-gray-200 outline-sky-500 transition-colors rounded-md p-4" />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
          {editingItem ? (
            <button onClick={handleDelete} disabled={loading} className="text-red-500 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer active:scale-95">
              <i className="fa-duotone fa-trash-can" /> Xóa
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            {/* 🚀 Thay onClose thành handleClose ở nút Hủy */}
            <button onClick={handleClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-xl transition cursor-pointer active:scale-95">Hủy</button>
            
            {/* 🚀 Disable nếu đang load HOẶC chưa có chỉnh sửa gì */}
            <button 
              onClick={handleSubmit} 
              disabled={loading || !hasChanges} 
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-xl shadow-[0_4px_12px_rgba(2,132,199,0.2)] transition cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none flex items-center gap-2"
            >
              {loading ? <i className="fa-duotone fa-spinner-third fa-spin" /> : <i className="fa-duotone fa-floppy-disk" />}
              {loading ? "Đang lưu" : "Lưu"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}