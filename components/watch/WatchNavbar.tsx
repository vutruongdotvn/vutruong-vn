"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import WatchDropdown from "./WatchDropdown";
import type { OPhimCategory, OPhimCountry, OPhimListType } from "@/lib/watch/types";

type Props = {
    categories: OPhimCategory[];
    countries: OPhimCountry[];
    listTypes: OPhimListType[];
};

export default function WatchNavbar({
    categories,
    countries,
    listTypes,
}: Props) {
    const [query, setQuery] = useState("");

    const topCategories = useMemo(
        () => [...categories].filter((c) => c?.name && c?.slug).slice(0, 24),
        [categories]
    );

    const topCountries = useMemo(
        () => [...countries].filter((c) => c?.name && c?.slug).slice(0, 24),
        [countries]
    );
    return (
        <header className="fixed inset-x-0 top-0 z-[70] border-b border-white/5 bg-[#040b1a]/85 backdrop-blur-xl">
            <div className="mx-auto flex h-[74px] w-full max-w-[1600px] items-center gap-5 px-5 md:px-8 xl:px-12">
                {/* Logo */}
                <Link
                    href="/watch"
                    className="flex shrink-0 items-center gap-3"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 shadow-[0_10px_30px_rgba(239,68,68,.35)]">
                        <span className="text-sm text-white">▶</span>
                    </div>
                    <span className="text-[28px] font-black tracking-tight text-white">
                        VT <span className="text-white/95">Films</span>
                    </span>
                </Link>

                {/* Search */}
                <div className="hidden min-w-[300px] max-w-[380px] flex-1 lg:block">
                    <div className="flex h-[48px] items-center gap-3 rounded-2xl border border-white/6 bg-white/8 px-4 text-slate-300 shadow-inner">
                        <span className="text-white/55">🔍</span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm phim..."
                            className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-slate-400 outline-none"
                        />
                    </div>
                </div>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-7 xl:flex">
                    <Link
                        href="/watch"
                        className="text-[15px] font-semibold text-white/90 transition hover:text-white"
                    >
                        Trang chủ
                    </Link>

                    <Link
                        href="/watch/browse/danh-sach/phim-moi-cap-nhat"
                        className="text-[15px] font-semibold text-white/90 transition hover:text-white"
                    >
                        Phim Mới
                    </Link>

                    <Link
                        href="/watch/browse/danh-sach/phim-le"
                        className="text-[15px] font-semibold text-white/90 transition hover:text-white"
                    >
                        Phim Lẻ
                    </Link>

                    <Link
                        href="/watch/browse/danh-sach/phim-bo"
                        className="text-[15px] font-semibold text-white/90 transition hover:text-white"
                    >
                        Phim Bộ
                    </Link>

                    <WatchDropdown
                        label="Danh Sách"
                        items={listTypes}
                        baseHref="/watch/browse/danh-sach"
                    />

                    <WatchDropdown
                        label="Thể Loại"
                        items={topCategories.map((c) => ({
                            name: c.name,
                            slug: c.slug,
                        }))}
                        baseHref="/watch/browse/the-loai"
                    />

                    <WatchDropdown
                        label="Quốc Gia"
                        items={topCountries.map((c) => ({
                            name: c.name,
                            slug: c.slug,
                        }))}
                        baseHref="/watch/browse/quoc-gia"
                    />
                </nav>

                {/* Avatar placeholder */}
                <div className="ml-auto hidden xl:flex">
                    <button className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white/80 transition hover:bg-white/12">
                        👤
                    </button>
                </div>

                {/* Mobile menu button */}
                <button className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white xl:hidden">
                    ☰
                </button>
            </div>
        </header>
    );
}