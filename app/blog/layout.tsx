import React from "react";
import BackgroundGlow from "@/components/home/BackgroundGlow";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog cá nhân | Lưu giữ những điều đẹp đẽ và giá trị!",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen py-24">
      <BackgroundGlow />
      <div className="max-w-[1080px] mx-auto px-4">
        <div className="grid grid-cols-12 gap-4">
          
          {/* LEFT SIDEBAR */}
          <aside className="col-span-12 lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              
              {/* PROFILE CARD */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <Image
                                src="/avatar.JPEG"
                                alt="avatar"
                                width={45}
                                height={45}
                                className="rounded-full"
                              />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Vũ Trường
                      <i className="fa-solid fa-badge-check text-sm ms-1 text-blue-600"></i>
                    </p>
                    <p className="text-sm text-gray-500">
                      @vutruong.vn
                    </p>
                  </div>
                </div>
              </div>

              {/* INTRO */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="font-semibold text-gray-900 mb-2">
                  Giới thiệu
                </p>
                <p className="text-sm text-gray-600">
                  Blog demo đang build trên next.js
                </p>
              </div>

              {/* PHOTOS */}
              <div className="bg-white rounded-xl shadow-sm p-4">
                <p className="font-semibold text-gray-900 mb-3">
                  Ảnh
                </p>

                <div className="grid grid-cols-3 gap-1">
                  <div className="bg-gray-200 aspect-2/3 rounded-lg" />
                  <div className="bg-gray-200 aspect-2/3 rounded-lg" />
                  <div className="bg-gray-200 aspect-2/3 rounded-lg" />
                </div>
              </div>

            </div>
          </aside>

          {/* MAIN FEED */}
          <section className="col-span-12 lg:col-span-7 space-y-6">
            {children}
          </section>

        </div>
      </div>
    </main>
  );
}