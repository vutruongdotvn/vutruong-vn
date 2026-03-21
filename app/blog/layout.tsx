import React from "react";
import BackgroundGlow from "@/components/home/BackgroundGlow";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen py-24">
      <BackgroundGlow />
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR */}
          <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              
              {/* PROFILE CARD */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-300" />
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
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-semibold text-gray-900 mb-2">
                  Giới thiệu
                </p>
                <p className="text-sm text-gray-600">
                  Blog demo đang build trên next.js
                </p>
              </div>

              {/* PHOTOS */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <p className="font-semibold text-gray-900 mb-3">
                  Khoảnh khắc
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-200 h-40 rounded-lg" />
                  <div className="bg-gray-200 h-40 rounded-lg" />
                  <div className="bg-gray-200 h-40 rounded-lg" />
                </div>
              </div>

            </div>
          </aside>

          {/* MAIN FEED */}
          <section className="col-span-12 lg:col-span-8 space-y-6">
            {children}
          </section>

        </div>
      </div>
    </main>
  );
}