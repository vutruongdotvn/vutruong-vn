"use client";

import { useEffect, useRef } from "react";
import type {
  CarouselInstance,
  FancyboxInstance,
  FancyboxOptions,
} from "@fancyapps/ui/dist/fancybox/";
import {
  findPostImageIndex,
  getPostImagePath,
} from "@/lib/postImageRoute";

const FANCYBOX_SELECTOR = "[data-fancybox]";
const EMPTY_IMAGES: readonly string[] = [];

type FancyboxWrapperProps = {
  /**
   * Ba props này chỉ bật đồng bộ URL cho gallery ảnh của trang bài viết.
   * Khi không truyền, Fancybox giữ nguyên hành vi dùng chung ở Blog/Tag.
   */
  postId?: string;
  images?: readonly string[];
  initialImageId?: string | null;
};

/* ========================================================================== */
/*  CÔNG TẮC BẬT / TẮT NHANH                                                  */
/* ========================================================================== */

// true: hiện toàn bộ toolbar; false: ẩn hoàn toàn toolbar.
const SHOW_TOOLBAR = true;

// true: bật plugin thumbnail; false: tắt hoàn toàn thumbnail và nút thumbs.
const SHOW_THUMBNAILS = true;

// true: thumbnail mở sẵn khi Fancybox xuất hiện.
// false: thumbnail ẩn lúc đầu, người dùng có thể bấm nút thumbs để mở.
const SHOW_THUMBNAILS_ON_START = false;

// true: hiện nút mũi tên Previous / Next ở hai bên ảnh.
const SHOW_ARROWS = true;

// true: bật tính năng trình chiếu tự động và nút autoplay trên toolbar.
const ENABLE_AUTOPLAY = true;

// true: tự chạy slideshow ngay khi mở; false: chờ người dùng bấm nút.
const AUTOPLAY_ON_START = false;

// true: bật tính năng và nút toàn màn hình.
const ENABLE_FULLSCREEN = true;

// true: bật giao diện Compact Mode giống ứng dụng Photos trên mobile.
// Fancybox mặc định kích hoạt khi chiều rộng hoặc chiều cao nhỏ hơn 578px.
const ENABLE_COMPACT_MODE = true;

// Chỉ hạn chế tải ảnh bằng chuột phải, không phải biện pháp bảo mật tuyệt đối.
const PROTECT_IMAGES = true;

/* ========================================================================== */
/*  TOÀN BỘ CẤU HÌNH FANCYBOX V6                                              */
/* ========================================================================== */

const FANCYBOX_OPTIONS: Partial<FancyboxOptions> = {
  /* ------------------------------------------------------------------------ */
  /* GIAO DIỆN CHUNG                                                          */
  /* ------------------------------------------------------------------------ */

  // Màu giao diện: "dark" | "light" | "auto".
  // "auto" sẽ tự chọn theo giao diện sáng/tối của hệ điều hành.
  theme: "auto",

  // Nút đóng nằm phía trên nội dung:
  // "auto" = Fancybox tự quyết định | true = luôn hiện | false = luôn ẩn.
  closeButton: "auto",

  // Bấm vào vùng nền: "close" = đóng Fancybox | false = không làm gì.
  backdropClick: "close",

  // Cho phép kéo ảnh lên/xuống để đóng Fancybox.
  dragToClose: true,

  // Ẩn thanh cuộn của trang web khi Fancybox đang mở.
  hideScrollbar: true,

  // true: chỉ cho phép một Fancybox hoạt động tại một thời điểm.
  closeExisting: true,

  // true: sử dụng chế độ dialog modal chuẩn và khóa tương tác bên ngoài.
  modal: true,

  // Trả focus về ảnh/nút đã mở Fancybox sau khi đóng.
  placeFocusBack: false,

  // Thời gian không tương tác trước khi giao diện điều khiển tự ẩn.
  // Đơn vị: mili giây | false = không bao giờ tự ẩn.
  idle: 3_500,

  /* ------------------------------------------------------------------------ */
  /* HIỆU ỨNG MỞ / ĐÓNG                                                       */
  /* ------------------------------------------------------------------------ */

  // true: ảnh phóng từ thumbnail lên khi mở và thu về thumbnail khi đóng.
  // false: Fancybox sẽ sử dụng showClass / hideClass cho ảnh.
  zoomEffect: false,

  // true: backdrop, toolbar và các thành phần giao diện fade khi mở/đóng.
  fadeEffect: true,

  // Hiệu ứng mở nội dung:
  // "f-fadeIn" | "f-zoomInUp" | false (không animation).
  // Khi zoomEffect=true và nội dung là ảnh, hiệu ứng zoom được ưu tiên.
  showClass: "f-fadeIn",

  // Hiệu ứng đóng nội dung: "f-fadeOut" | false (không animation).
  hideClass: "f-fadeOut",

  /* ------------------------------------------------------------------------ */
  /* TƯƠNG TÁC CHUỘT / BÀN PHÍM                                               */
  /* ------------------------------------------------------------------------ */

  // Hành động khi lăn chuột trên Fancybox:
  // "slide" = chuyển ảnh | "close" = đóng | undefined = Panzoom xử lý zoom.
  wheel: undefined,

  // Có thể xóa những phím không muốn sử dụng hoặc đổi action thành:
  // "close" | "next" | "prev".
  keyboard: {
    Escape: "close",
    Delete: "close",
    Backspace: "close",
    ArrowLeft: "prev",
    ArrowRight: "next",
    ArrowUp: "prev",
    ArrowDown: "next",
    PageUp: "prev",
    PageDown: "next",
  },

  /* ------------------------------------------------------------------------ */
  /* NHÓM ẢNH / URL                                                           */
  /* ------------------------------------------------------------------------ */

  // Ảnh đầu tiên được mở trong gallery, bắt đầu từ 0.
  startIndex: 0,

  // false: chỉ gom các phần tử có cùng data-fancybox.
  // true: gom tất cả phần tử khớp selector thành một gallery.
  groupAll: false,

  // Thuộc tính dùng để phân nhóm gallery | false = không phân nhóm.
  groupAttr: "data-fancybox",

  // false: không thêm #gallery vào URL và không tạo history của lightbox.
  // Đổi thành {} nếu muốn bật Hash plugin.
  Hash: false,

  /* ------------------------------------------------------------------------ */
  /* CAROUSEL: CHUYỂN SLIDE VÀ CÁC PLUGIN                                     */
  /* ------------------------------------------------------------------------ */

  Carousel: {
    // true: từ ảnh cuối chuyển tiếp về ảnh đầu và ngược lại.
    infinite: false,

    // Hiệu ứng chuyển giữa các ảnh:
    // "fade" | "crossfade" | "slide".
    transition: "fade",

    // false: slide chạy ngang | true: slide chạy dọc.
    vertical: false,

    // Căn slide đang active vào giữa viewport.
    center: true,

    // Lấp khoảng trống còn dư khi infinite=false.
    fill: true,

    // true: cho phép dừng tự do ở vị trí bất kỳ sau khi kéo.
    // Fancybox xem ảnh nên giữ false để luôn khớp đúng từng slide.
    dragFree: false,

    // Mỗi trang chỉ hiển thị một slide.
    slidesPerPage: 1,

    /* MŨI TÊN -------------------------------------------------------------- */

    // {} = bật với icon mặc định | false = ẩn cả hai mũi tên.
    Arrows: SHOW_ARROWS ? {} : false,

    /* TOOLBAR -------------------------------------------------------------- */

    // Đổi SHOW_TOOLBAR phía trên thành false để ẩn hoàn toàn toolbar.
    Toolbar: SHOW_TOOLBAR
      ? {
        // true: toolbar nổi trên nội dung | false: toolbar chiếm một hàng.
        absolute: true,

        // true = luôn bật | false = tắt | "auto" = chỉ bật khi có ảnh zoom.
        enabled: true,

        display: {
          // Các item có thể dùng:
          // counter, zoomIn, zoomOut, toggle1to1, rotateCCW, rotateCW,
          // flipX, flipY, reset, autoplay, thumbs, fullscreen,
          // download, close.
          left: ["counter"],
          middle: [],
          right: ["close"],
        },
      }
      : false,

    /* THUMBNAIL ------------------------------------------------------------ */

    // Đổi SHOW_THUMBNAILS phía trên thành false để tắt hoàn toàn.
    Thumbs: SHOW_THUMBNAILS
      ? {
        // Kiểu thumbnail:
        // "modern" = giống Apple Photos
        // "classic" = carousel thumbnail truyền thống
        // "scrollable" = danh sách thumbnail cuộn tự do.
        type: "scrollable",

        // Thumbnail chỉ được tạo khi gallery có ít nhất số ảnh này.
        minCount: 2,

        // Mở/ẩn thumbnail lúc Fancybox vừa xuất hiện.
        showOnStart: SHOW_THUMBNAILS_ON_START,
      }
      : false,

    /* AUTOPLAY / SLIDESHOW ------------------------------------------------- */

    // Đổi ENABLE_AUTOPLAY phía trên thành false để tắt plugin.
    Autoplay: ENABLE_AUTOPLAY
      ? {
        // Có tự chạy ngay sau khi mở Fancybox hay không.
        autoStart: AUTOPLAY_ON_START,

        // Thời gian hiển thị mỗi slide, đơn vị mili giây.
        timeout: 5_000,

        // Tạm dừng khi rê chuột lên nội dung.
        pauseOnHover: true,

        // Hiện thanh tiến trình của slideshow.
        showProgressbar: true,
      }
      : false,

    /* FULLSCREEN ----------------------------------------------------------- */

    // Đổi ENABLE_FULLSCREEN phía trên thành false để tắt plugin.
    Fullscreen: ENABLE_FULLSCREEN
      ? {
        // true: tự chuyển toàn màn hình khi mở Fancybox.
        autoStart: false,
      }
      : false,

    /* LAZY LOAD ------------------------------------------------------------ */

    Lazyload: {
      // Số slide phía trước và phía sau được tải trước.
      preload: 1,

      // Hiển thị loading spinner khi nội dung đang tải.
      showLoading: true,
    },

    /* ẢNH / PANZOOM -------------------------------------------------------- */


    /* VIDEO ---------------------------------------------------------------- */

    Video: {
      // true: video tự phát khi slide video xuất hiện.
      autoplay: false,

      youtube: {
        controls: 1,
        enablejsapi: 1,
        nocookie: 1,
        rel: 0,
        fs: 1,
      },

      vimeo: {
        byline: 0,
        color: "00adef",
        controls: 1,
        dnt: 1,
        muted: 0,
      },
    },

    /* IFRAME / PDF / GOOGLE MAPS ------------------------------------------ */

    Html: {
      // true: tự thay đổi kích thước iframe theo nội dung cùng origin.
      autosize: false,

      // true: chờ iframe tải xong rồi mới hiển thị.
      preload: false,
    },
  },

  /* ------------------------------------------------------------------------ */
  /* VIỆT HÓA TOOLTIP                                                         */
  /* ------------------------------------------------------------------------ */

  l10n: {
    CLOSE: "Đóng",
    NEXT: "Ảnh tiếp theo",
    PREV: "Ảnh trước",
    MODAL: "Nhấn ESC để đóng trình xem",
    ERROR: "Có lỗi xảy ra, vui lòng thử lại",
    IMAGE_ERROR: "Không thể tải hình ảnh",
    IFRAME_ERROR: "Không thể tải nội dung",
    ZOOM_IN: "Phóng to",
    ZOOM_OUT: "Thu nhỏ",
    TOGGLE_FULL: "Đổi mức thu phóng",
    TOGGLE_1TO1: "Hiển thị kích thước thật",
    ROTATE_CCW: "Xoay trái",
    ROTATE_CW: "Xoay phải",
    FLIP_X: "Lật ngang",
    FLIP_Y: "Lật dọc",
    RESET: "Đặt lại",
    AUTOPLAY_START: "Bắt đầu trình chiếu",
    AUTOPLAY_STOP: "Dừng trình chiếu",
    TOGGLE_THUMBS: "Bật/tắt ảnh thu nhỏ",
    TOGGLE_FS: "Bật/tắt toàn màn hình",
    DOWNLOAD: "Tải xuống",
  },
};

export default function FancyboxWrapper({
  postId,
  images = EMPTY_IMAGES,
  initialImageId = null,
}: FancyboxWrapperProps) {
  const autoOpenedRouteRef = useRef<string | null>(null);

  useEffect(() => {
    let disposed = false;
    let unbind: (() => void) | undefined;
    let retryFrame: number | undefined;
    let trackedInstance: FancyboxInstance | undefined;

    const normalizedPostId = postId?.trim() || null;
    const basePath = normalizedPostId
      ? `/blog/post/${normalizedPostId}`
      : null;
    const galleryName = normalizedPostId
      ? `post-${normalizedPostId}`
      : null;
    const requestedImageIndex = findPostImageIndex(images, initialImageId);
    const autoOpenRouteKey =
      basePath && requestedImageIndex >= 0
        ? `${basePath}:${initialImageId}`
        : null;
    const requestedImagePath =
      normalizedPostId && requestedImageIndex >= 0
        ? getPostImagePath(
            normalizedPostId,
            images[requestedImageIndex] ?? "",
          )
        : null;

    if (!initialImageId) {
      // Cho phép cùng một ảnh được tự mở lại nếu component được tái sử dụng
      // qua một lượt điều hướng route gốc -> route ảnh mới.
      autoOpenedRouteRef.current = null;
    }

    const isCurrentPostPath = () =>
      !!basePath &&
      (window.location.pathname === basePath ||
        window.location.pathname.startsWith(`${basePath}/`));

    const isCanonicalDetailContext = () =>
      document.querySelector('[data-blog-route-context="detail"]') !== null &&
      document.querySelector(".modal-post-frame") === null;

    const isHardLoadedRequestedImage = () => {
      if (
        !requestedImagePath ||
        window.location.pathname !== requestedImagePath
      ) {
        return false;
      }

      const navigationEntry = window.performance.getEntriesByType(
        "navigation",
      )[0];

      if (!navigationEntry?.name) return false;

      try {
        // Soft navigation từ PostFeed giữ document entry là /blog (hoặc Tag),
        // còn paste URL/reload tạo document entry đúng route ảnh canonical.
        return new URL(navigationEntry.name).pathname === requestedImagePath;
      } catch {
        return false;
      }
    };

    const isPostGalleryInstance = (instance: FancyboxInstance) =>
      !!galleryName &&
      instance.getSlide()?.triggerEl?.getAttribute("data-fancybox") ===
        galleryName;

    const replacePath = (nextPath: string) => {
      if (
        disposed ||
        !isCurrentPostPath() ||
        window.location.pathname === nextPath
      ) {
        return;
      }

      // Next.js 16 tích hợp native History API với App Router. replaceState
      // không refetch và không tạo thêm entry khi người dùng chuyển ảnh.
      window.history.replaceState(null, "", nextPath);
    };

    const syncImagePath = (instance: FancyboxInstance, index: number) => {
      const imageUrl = images[index];

      if (
        !normalizedPostId ||
        !imageUrl ||
        !isCanonicalDetailContext() ||
        !isPostGalleryInstance(instance)
      ) {
        return;
      }

      trackedInstance = instance;
      replacePath(getPostImagePath(normalizedPostId, imageUrl));
    };

    const handleReady = (instance: FancyboxInstance) => {
      const currentIndex = instance.getCarousel()?.getPageIndex() ?? 0;
      syncImagePath(instance, currentIndex);
    };

    const handleCarouselChange = (
      instance: FancyboxInstance,
      _carousel: CarouselInstance,
      currentIndex: number,
    ) => {
      syncImagePath(instance, currentIndex);
    };

    const handleDestroy = (instance: FancyboxInstance) => {
      if (disposed || trackedInstance !== instance || !basePath) return;

      trackedInstance = undefined;
      replacePath(basePath);
    };

    void (async () => {
      // Import đúng entry point được Fancybox v6 khuyến nghị.
      const [{ Fancybox }, { Compactmode }] = await Promise.all([
        import("@fancyapps/ui/dist/fancybox/"),
        import("@fancyapps/ui/dist/fancybox/fancybox.compactmode.js"),
        import("@fancyapps/ui/dist/fancybox/fancybox.css"),
        import("@fancyapps/ui/dist/fancybox/fancybox.compactmode.css"),
      ]);

      // Ngăn bind muộn nếu component đã unmount trong React Strict Mode.
      if (disposed) return;

      const fancyboxOptions: Partial<FancyboxOptions> = {
        ...FANCYBOX_OPTIONS,
        on: normalizedPostId
          ? {
              ...FANCYBOX_OPTIONS.on,
              ready: handleReady,
              "Carousel.change": handleCarouselChange,
              destroy: handleDestroy,
            }
          : FANCYBOX_OPTIONS.on,
        // Bỏ Compactmode khỏi plugins nếu không muốn giao diện mobile đặc biệt.
        plugins: ENABLE_COMPACT_MODE ? { Compactmode } : undefined,
      };

      Fancybox.bind(FANCYBOX_SELECTOR, fancyboxOptions);
      unbind = () => Fancybox.unbind(FANCYBOX_SELECTOR);

      const openRequestedImage = () => {
        if (
          disposed ||
          !galleryName ||
          !autoOpenRouteKey ||
          !isCanonicalDetailContext() ||
          !isHardLoadedRequestedImage() ||
          autoOpenedRouteRef.current === autoOpenRouteKey
        ) {
          return true;
        }

        // Lọc theo đúng giá trị data-fancybox thay vì ghép selector từ dữ
        // liệu động; nhờ vậy không ảnh hưởng gallery cover/avatar/sidebar.
        const galleryNodes = Array.from(
          document.querySelectorAll<HTMLElement>(FANCYBOX_SELECTOR),
        ).filter(
          (node) => node.getAttribute("data-fancybox") === galleryName,
        );

        if (!galleryNodes[requestedImageIndex]) return false;

        autoOpenedRouteRef.current = autoOpenRouteKey;
        const instance = Fancybox.fromNodes(galleryNodes, {
          ...fancyboxOptions,
          startIndex: requestedImageIndex,
        });

        if (!instance) {
          autoOpenedRouteRef.current = null;
          return false;
        }

        trackedInstance = instance;
        return true;
      };

      // Thông thường anchors đã có sẵn khi effect chạy. Retry đúng một frame
      // bảo vệ trường hợp Swiper vừa hoàn tất mount trong cùng chu kỳ hydrate.
      if (!openRequestedImage()) {
        retryFrame = window.requestAnimationFrame(openRequestedImage);
      }
    })();

    return () => {
      disposed = true;
      if (retryFrame !== undefined) {
        window.cancelAnimationFrame(retryFrame);
      }
      // Nếu người dùng điều hướng khỏi trang khi lightbox bài viết còn mở,
      // dọn instance đã theo dõi để overlay không tồn tại trên route kế tiếp.
      if (trackedInstance) {
        autoOpenedRouteRef.current = null;
      }
      trackedInstance?.destroy();
      trackedInstance = undefined;
      unbind?.();
    };
  }, [images, initialImageId, postId]);

  return null;
}
