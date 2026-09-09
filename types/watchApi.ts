/** B1 keeps only the fields needed to inspect the list contract. No media URLs. */
export type WatchLatestPage = {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  items: ReadonlyArray<{ name: string | null; slug: string | null }>;
  observedItemFields: ReadonlyArray<string>;
};

/** Only display data is retained. Episode/player URLs never enter the Hero cache. */
export type WatchMovieSummary = {
  id: string | null;
  slug: string;
  name: string;
  originalName: string | null;
  description: string | null;
  posterUrl: string | null;
  quality: string | null;
  language: string | null;
  duration: string | null;
  currentEpisode: string | null;
  year: string | null;
  genres: ReadonlyArray<string>;
  countries: ReadonlyArray<string>;
  director: string | null;
  casts: string | null;
};

export type WatchApiErrorCode =
  | "browser_only" | "inactive" | "invalid_request" | "access_denied"
  | "cancelled" | "timeout" | "queue_timeout" | "busy" | "rate_limited"
  | "http_error" | "transport" | "invalid_response" | "response_too_large";

export class WatchApiError extends Error {
  constructor(
    public readonly code: WatchApiErrorCode,
    public readonly details: { status?: number; field?: string; retryAt?: number } = {},
  ) {
    super(code);
    this.name = "WatchApiError";
  }
}

export function watchApiErrorMessage(error: unknown): string {
  if (!(error instanceof WatchApiError)) return "Không thể đọc dữ liệu phim. Vui lòng thử lại.";
  switch (error.code) {
    case "access_denied": case "inactive": return "Quyền Watch chưa được xác minh hoặc đã thay đổi.";
    case "cancelled": return "Đã hủy lượt tải.";
    case "timeout": return "Lượt tải quá thời gian chờ. Chưa có yêu cầu tự thử lại.";
    case "queue_timeout": return "Hàng đợi quá thời gian chờ. Vui lòng thử lại.";
    case "busy": return "Đang có nhiều yêu cầu. Vui lòng chờ lượt tải hiện tại hoàn tất.";
    case "rate_limited": return error.details.retryAt
      ? `Nguồn đang giới hạn lượt gọi. Có thể thử lại sau ${new Date(error.details.retryAt).toLocaleTimeString("vi-VN")}.`
      : "Nguồn đang giới hạn lượt gọi. Vui lòng thử lại sau.";
    case "http_error": return `Nguồn phim trả HTTP ${error.details.status ?? "lỗi"}. Chưa có yêu cầu tự thử lại.`;
    case "transport": return "Browser chưa đọc được phản hồi. Kiểm tra Network/Console để phân biệt lỗi mạng, CORS hoặc chuyển hướng.";
    case "response_too_large": return "Phản hồi vượt giới hạn đọc an toàn của lượt thử này (2 MiB).";
    case "invalid_response": return "Phản hồi chưa đúng cấu trúc tài liệu. Cần kiểm tra JSON thật trước khi ghép giao diện phim.";
    case "browser_only": return "API phim chỉ được gọi từ browser.";
    case "invalid_request": return "Tham số yêu cầu phim không hợp lệ.";
  }
}
