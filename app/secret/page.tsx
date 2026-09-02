"use client";

import { useState, useEffect } from "react";
import SecretCard from "@/components/secret/SecretCard";
import SecretModal from "@/components/secret/SecretModal";
import { SecretItem } from "@/types/secret";
import { fetchSecrets } from "@/services/secretService";

export default function SecretPage() {
  const [secrets, setSecrets] = useState<SecretItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SecretItem | null>(null);

  // State giới hạn số lượng Tags ở Sidebar
  const [tagLimit, setTagLimit] = useState(10);
  const [isMobile, setIsMobile] = useState(false);

  // 🚀 State giới hạn số lượng Card hiển thị
  const [cardLimit, setCardLimit] = useState(10);
  const CARD_LOAD_MORE = 6; // Số lượng tải thêm mỗi lần bấm

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Đặt mặc định ban đầu: 3 cho Mobile, 10 cho PC
      setTagLimit(mobile ? 3 : 9);
    };
    handleResize(); // Chạy lần đầu
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchSecrets();
    setSecrets(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset lại số lượng card hiển thị khi người dùng đổi từ khóa hoặc tag
  useEffect(() => {
    setCardLimit(10);
  }, [searchQuery, selectedTag]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: SecretItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  // Logic tính toán và sắp xếp Tags (Nhiều nhất xếp lên trên)
  const allTags = secrets.flatMap((s) => s.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const visibleTags = sortedTags.slice(0, tagLimit);
  const hasMoreTags = tagLimit < sortedTags.length;

  const loadMoreTags = () => {
    setTagLimit(prev => prev + (isMobile ? 5 : 10));
  };

  // Lọc dữ liệu Realtime
  const filteredSecrets = secrets.filter((secret) => {
    const matchesSearch =
      secret.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.account?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      secret.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag ? secret.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  // 🚀 Logic cắt mảng dữ liệu để hiển thị giới hạn Card
  const displayedSecrets = filteredSecrets.slice(0, cardLimit);
  const hasMoreSecrets = cardLimit < filteredSecrets.length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-18">
      
      {/* 🚀 ẨN TOÀN BỘ UI KHI ĐANG LOAD */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full gap-4">
          <i className="fa-duotone fa-spinner-third fa-spin text-3xl text-muted-foreground opacity-50" />
        </div>
      ) : (
        <>
          {/* Header */}

          {/* Bố cục 2 Cột */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">

            {/* CỘT TRÁI: Sidebar Tags */}
            <div className="w-full lg:w-80 flex-shrink-0 space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative group mb-3 sm:mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.013)]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="fa-duotone fa-search text-muted-foreground text-base group-focus-within:text-sky-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm"
                  value={searchQuery} autoComplete="off"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground transition shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div className="bg-card rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border p-4 sticky top-24">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
                  <i className="fa-duotone fa-filter-list" /> Phân loại
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer active:scale-95 ${!selectedTag ? 'bg-sky-50 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-foreground/75 hover:bg-muted/50'}`}
                    >
                      <span className="flex items-center gap-2"><i className="fa-duotone fa-grid-2" /> Tất cả</span>
                      <span className="bg-card border border-border text-foreground/75 px-2 py-0.5 rounded-md text-xs shadow-sm font-bold">{secrets.length}</span>
                    </button>
                  </li>
                  {visibleTags.map(([tag, count]) => (
                    <li key={tag}>
                      <button
                        onClick={() => setSelectedTag(tag)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer active:scale-95 ${selectedTag === tag ? 'bg-sky-50 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300 shadow-sm' : 'text-foreground/75 hover:bg-muted/50'}`}
                      >
                        <span className="capitalize flex items-center gap-2 truncate pr-2"><i className="fa-duotone fa-hashtag opacity-40" /> <span className="truncate">{tag}</span></span>
                        <span className="bg-card border border-border text-foreground/75 px-2 py-0.5 rounded-md text-xs shadow-sm font-bold flex-shrink-0">{count as React.ReactNode}</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Nút tải thêm Tags */}
                {hasMoreTags && (
                  <button
                    onClick={loadMoreTags}
                    className="w-full mt-3 py-2 text-xs font-semibold text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-300 bg-sky-50/50 dark:bg-sky-400/10 hover:bg-sky-50 dark:hover:bg-sky-400/20 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <i className="fa-duotone fa-angle-down" /> Tải thêm ({sortedTags.length - tagLimit})
                  </button>
                )}
              </div>
              <button
                onClick={handleOpenCreate}
                className="w-full py-3 px-4 bg-card rounded-xl font-medium shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-sm text-foreground/75 hover:text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <i className="fa-duotone fa-plus text-lg" /> Thêm tài khoản
              </button>
            </div>

            {/* CỘT PHẢI: Search & Lưới Card */}
            <div className="flex-1 min-w-0">
              {/* Grid Cards (2 columns on lg) */}
              {filteredSecrets.length === 0 ? (
                <div className="text-center py-24 bg-card border border-dashed border-border rounded-3xl">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fa-duotone fa-box-open text-4xl text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">Không tìm thấy dữ liệu</h3>
                  <p className="text-muted-foreground text-sm">Hãy thử tìm kiếm với từ khóa khác hoặc thêm tài khoản mới.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {displayedSecrets.map((secret) => (
                      <SecretCard
                        key={secret.id}
                        secret={secret}
                        searchQuery={searchQuery}
                        onEdit={handleOpenEdit}
                      />
                    ))}
                  </div>

                  {/* 🚀 Nút tải thêm Tài Khoản */}
                  {hasMoreSecrets && (
                    <div className="flex justify-center mt-8">
                      <button 
                        onClick={() => setCardLimit(prev => prev + CARD_LOAD_MORE)}
                        className="bg-card border border-border text-foreground/75 hover:bg-muted/50 hover:text-sky-600 dark:hover:text-sky-300 px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition active:scale-95 flex items-center gap-2 cursor-pointer"
                      >
                        <i className="fa-duotone fa-layer-plus" /> Xem thêm ({filteredSecrets.length - cardLimit} tài khoản)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal Thêm/Sửa Tài Khoản */}
      <SecretModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        editingItem={editingItem}
      />
    </main>
  );
}
