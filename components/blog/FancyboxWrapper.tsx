"use client";

import { useEffect } from "react";

export default function FancyboxWrapper() {
  useEffect(() => {
    (async () => {
      // Dynamic import để tránh lỗi "window is not defined" trên Next.js SSR
      const { Fancybox } = await import("@fancyapps/ui");
      // Import CSS nếu bạn chưa import ở global (layout.tsx)
      await import("@fancyapps/ui/dist/fancybox/fancybox.css");

      Fancybox.bind("[data-fancybox]", {
        // Tương tác chung
        dragToClose: true, // Kéo xuống để đóng (nên để false nếu dùng dải thumbnail)
        keyboard: true,     // Cho phép dùng phím mũi tên để chuyển ảnh
        wheel: "zoom",     // Lăn chuột để chuyển ảnh ("slide", "zoom", "close")
        
        // Hoạt ảnh xuất hiện / biến mất
        showClass: "f-fadeIn",
        hideClass: "f-fadeOut",

        // chặn đổi URL dạng #gallery
        Hash: false,

        // Tùy chỉnh ảnh
        Images: {
          initialSize: "fit", // "fit" (vừa màn hình) hoặc "cover" (lấp đầy)
          zoom: true,         // Cho phép click đúp để zoom
        },

        // Bảo vệ ảnh (Chặn click chuột phải, tải xuống)
        protect: true, 

        // Tùy chỉnh Trình chiếu (Carousel)
        Carousel: {
          infinite: false,     // Cuộn lặp lại vô tận (hết ảnh cuối về ảnh đầu)
          transition: "crossfade",// Hiệu ứng chuyển ảnh: "slide", "fade", "crossfade"
        },

        // Thanh công cụ (Toolbar)
        Toolbar: {
          display: {
            left: ["infobar"], // Hiển thị số đếm (vd: 1 / 5)
            middle: [], // Bỏ trống nếu không muốn hiện các nút xoay/lật ở giữa
            right: ["slideshow", "thumbs", "download", "close"], // Các nút bên phải
          },
        },

        // Dải ảnh thu nhỏ (Thumbnails) bên dưới
        Thumbs: {
          type: "modern", // "modern" hoặc "classic"
          autoStart: false, // Tự động mở dải thumbnail khi bật lightbox
        },

        // Việt hóa các text mặc định (Nếu trang web của bạn thuần Việt)
        l10n: {
          CLOSE: "Đóng",
          NEXT: "Tiếp theo",
          PREV: "Trước đó",
          MODAL: "Bạn có thể đóng modal này bằng phím ESC",
          ERROR: "Có lỗi xảy ra, vui lòng thử lại sau",
          IMAGE_ERROR: "Không tìm thấy hình ảnh",
          ELEMENT_NOT_FOUND: "Không tìm thấy phần tử HTML",
          AJAX_NOT_FOUND: "Lỗi tải dữ liệu",
          AJAX_FORBIDDEN: "Lỗi truy cập dữ liệu",
          IFRAME_ERROR: "Lỗi tải trang",
          TOGGLE_ZOOM: "Bật/tắt thu phóng",
          TOGGLE_THUMBS: "Bật/tắt ảnh thu nhỏ",
          TOGGLE_SLIDESHOW: "Bật/tắt trình chiếu",
          TOGGLE_FULLSCREEN: "Bật/tắt toàn màn hình",
          DOWNLOAD: "Tải xuống",
        },
      });
    })();

    return () => {
      import("@fancyapps/ui").then(({ Fancybox }) => {
        Fancybox.destroy();
      });
    };
  }, []);

  return null;
}