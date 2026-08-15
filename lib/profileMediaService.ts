import { supabase } from "@/lib/supabase";

export type ProfileMediaFolder =
  | "all"
  | "posts"
  | "avatars"
  | "covers"
  | "featureds";

export type ProfileCloudinaryAsset = {
  asset_id: string;
  public_id: string;
  secure_url: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number;
  created_at: string;
  folder: Exclude<ProfileMediaFolder, "all"> | "other";
};

export type ProfileAssetsPage = {
  assets: ProfileCloudinaryAsset[];
  next_cursor: string | null;
};

type ProfileAssetsApiResponse = {
  success?: boolean;
  error?: string;
  assets?: ProfileCloudinaryAsset[];
  next_cursor?: string | null;
  retry_at?: string | null;
  retry_after?: number;
  deleted_public_ids?: string[];
};

const LIBRARY_COOLDOWN_KEY = "vtzone:profile-images:cooldown-until";
const LIBRARY_CACHE_TTL_MS = 5 * 60_000;
const libraryRequests = new Map<string, Promise<ProfileAssetsPage>>();
const libraryPageCache = new Map<
  string,
  { expiresAt: number; page: ProfileAssetsPage }
>();
let memoryCooldownUntil = 0;

async function readJsonPayload(response: Response) {
  const rawBody = await response.text();

  if (!rawBody.trim()) {
    throw new Error(
      `Máy chủ không trả về dữ liệu (${response.status}). Vui lòng thử lại.`
    );
  }

  try {
    return JSON.parse(rawBody) as ProfileAssetsApiResponse;
  } catch {
    throw new Error(
      `Phản hồi từ máy chủ không hợp lệ (${response.status}). Vui lòng thử lại.`
    );
  }
}

function readCooldownUntil() {
  if (memoryCooldownUntil > Date.now()) return memoryCooldownUntil;
  if (typeof window === "undefined") return 0;

  try {
    const value = Number(window.sessionStorage.getItem(LIBRARY_COOLDOWN_KEY));
    if (Number.isFinite(value) && value > Date.now()) {
      memoryCooldownUntil = value;
      return value;
    }
  } catch {
    // sessionStorage có thể bị chặn; khóa trong bộ nhớ vẫn hoạt động.
  }

  return 0;
}

function writeCooldownUntil(value: number) {
  memoryCooldownUntil = value;

  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(LIBRARY_COOLDOWN_KEY, String(value));
    } catch {
      // Không cần làm hỏng luồng chỉ vì sessionStorage bị chặn.
    }
  }
}

function formatCooldownMessage(cooldownUntil: number) {
  const retryTime = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(cooldownUntil));

  return `Cloudinary đã hết quota Admin API. Thư viện sẽ thử lại sau ${retryTime} (giờ Việt Nam).`;
}

function getRetryTimestamp(result: ProfileAssetsApiResponse) {
  const parsedRetryAt = result.retry_at ? Date.parse(result.retry_at) : NaN;
  if (Number.isFinite(parsedRetryAt) && parsedRetryAt > Date.now()) {
    return parsedRetryAt;
  }

  if (
    typeof result.retry_after === "number" &&
    Number.isFinite(result.retry_after) &&
    result.retry_after > 0
  ) {
    return Date.now() + result.retry_after * 1000;
  }

  return Date.now() + 60_000;
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  return session.access_token;
}

export async function fetchProfileCloudinaryAssets(options?: {
  cursor?: string | null;
  folder?: ProfileMediaFolder;
}): Promise<ProfileAssetsPage> {
  const cooldownUntil = readCooldownUntil();
  if (cooldownUntil > Date.now()) {
    throw new Error(formatCooldownMessage(cooldownUntil));
  }

  const folder = options?.folder ?? "all";
  const cursor = options?.cursor ?? null;
  const requestKey = `${folder}:${cursor ?? "first"}`;
  const cached = libraryPageCache.get(requestKey);
  if (cached && cached.expiresAt > Date.now()) return cached.page;
  if (cached) libraryPageCache.delete(requestKey);

  const existingRequest = libraryRequests.get(requestKey);
  if (existingRequest) return existingRequest;

  const request = (async () => {
    const token = await getAccessToken();
    const params = new URLSearchParams();

    if (cursor) params.set("cursor", cursor);
    if (folder !== "all") params.set("folder", folder);

    const query = params.toString();
    const response = await fetch(
      query ? `/api/profile-images?${query}` : "/api/profile-images",
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const result = await readJsonPayload(response);

    if (response.status === 420 || response.status === 429) {
      const retryTimestamp = getRetryTimestamp(result);
      writeCooldownUntil(retryTimestamp);
      throw new Error(result.error || formatCooldownMessage(retryTimestamp));
    }

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Không thể tải thư viện Cloudinary.");
    }

    const page = {
      assets: Array.isArray(result.assets) ? result.assets : [],
      next_cursor:
        typeof result.next_cursor === "string" ? result.next_cursor : null,
    };

    libraryPageCache.set(requestKey, {
      page,
      expiresAt: Date.now() + LIBRARY_CACHE_TTL_MS,
    });
    return page;
  })().finally(() => {
    libraryRequests.delete(requestKey);
  });

  libraryRequests.set(requestKey, request);
  return request;
}

export function invalidateProfileAssetsCache(folder?: ProfileMediaFolder) {
  if (!folder || folder === "all") {
    libraryPageCache.clear();
    return;
  }

  for (const key of libraryPageCache.keys()) {
    if (key.startsWith(`${folder}:`) || key.startsWith("all:")) {
      libraryPageCache.delete(key);
    }
  }
}

export async function deleteProfileLibraryAssets(publicIds: string[]) {
  const uniquePublicIds = [...new Set(publicIds.filter(Boolean))];
  if (uniquePublicIds.length === 0) return [];

  const token = await getAccessToken();
  const response = await fetch("/api/profile-images", {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ public_ids: uniquePublicIds }),
  });
  const result = await readJsonPayload(response);

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Không thể xóa ảnh profile khỏi Cloudinary.");
  }

  invalidateProfileAssetsCache();
  return Array.isArray(result.deleted_public_ids)
    ? result.deleted_public_ids
    : uniquePublicIds;
}

// Chỉ dùng để dọn asset mới upload nếu cập nhật Supabase thất bại.
export async function deleteProfileCloudinaryAssets(publicIds: string[]) {
  const uniquePublicIds = [...new Set(publicIds.filter(Boolean))];
  if (uniquePublicIds.length === 0) return;

  const token = await getAccessToken();
  const response = await fetch("/api/delete-images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ public_ids: uniquePublicIds }),
  });
  const result = await readJsonPayload(response);

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Không thể dọn ảnh upload chưa sử dụng.");
  }
}

export function profileMediaServiceError(error: unknown) {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "Có lỗi xảy ra, vui lòng thử lại.";

  if (
    /the string did not match|failed to fetch|load failed|networkerror/i.test(
      message
    )
  ) {
    return "Kết nối bị gián đoạn khi xử lý ảnh. Vui lòng kiểm tra mạng và thử lại.";
  }

  return message;
}
