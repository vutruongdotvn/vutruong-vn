import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ModalFullPostData } from "@/components/blog/modal/ModalFullPostV2";

// Chỉ RAM của tab hiện tại, không localStorage/IndexedDB hoặc cache server.
// TTL tính từ lúc tải, không gia hạn khi đọc. Tối đa 20 bài và 20 profile.
const POST_TTL_MS = 60_000;
const PROFILE_TTL_MS = 5 * 60_000;
const MAX_CACHE_ENTRIES = 20;
const REQUEST_TIMEOUT_MS = 10_000;
const POST_ID_PATTERN = /^\d{20}$/;

type Profile = { name: string | null; avatar: string | null };
type Revision = {
  userId: string;
  createdAt: string;
  updatedAt: string | null;
};
type CachedPost = Revision & {
  post: ModalFullPostData;
  expiresAt: number;
};
type CachedProfile = { profile: Profile; expiresAt: number };

const posts = new Map<string, CachedPost>();
const profiles = new Map<string, CachedProfile>();
const postRequests = new Map<string, Promise<ModalFullPostData | null>>();
const profileRequests = new Map<string, Promise<Profile | null>>();
let publicClient: SupabaseClient | undefined;

function getPublicClient() {
  if (publicClient) return publicClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing public Supabase configuration");

  // Client độc lập: KHÔNG import supabase có session admin từ lib/supabase.
  // Kể cả khi admin đang đăng nhập, các query này vẫn chỉ có quyền anonymous.
  publicClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: "vtzone-public-modal-no-session",
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
  return publicClient;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getRevision(value: unknown, postId: string): Revision | null {
  if (!isRecord(value) || String(value.id) !== postId) return null;
  if (value.visibility !== "public") return null;

  const userId = getString(value.user_id);
  const createdAt = getString(value.created_at);
  if (!userId || !createdAt) return null;

  return { userId, createdAt, updatedAt: getString(value.updated_at) };
}

function readCache<T extends { expiresAt: number }>(
  cache: Map<string, T>,
  key: string
): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;

  cache.delete(key);
  if (entry.expiresAt <= Date.now()) return undefined;

  cache.set(key, entry); // LRU: bài/profile vừa dùng đứng cuối Map.
  return entry;
}

function writeCache<T extends { expiresAt: number }>(
  cache: Map<string, T>,
  key: string,
  entry: T
) {
  const now = Date.now();
  for (const [cachedKey, cachedEntry] of cache) {
    if (cachedEntry.expiresAt <= now) cache.delete(cachedKey);
  }
  cache.delete(key);
  cache.set(key, entry);
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
}

function loadPublicProfile(userId: string): Promise<Profile | null> {
  const cached = readCache(profiles, userId);
  if (cached) return Promise.resolve(cached.profile);
  const pending = profileRequests.get(userId);
  if (pending) return pending;

  const request = (async () => {
    const { data, error } = await getPublicClient()
      .from("profiles")
      .select("name, avatar")
      .eq("id", userId)
      .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
      .maybeSingle();

    // Chỉ cache tên/avatar công khai, KHÔNG cache user/session/quyền admin.
    if (error || !isRecord(data)) return null;
    const profile = { name: getString(data.name), avatar: getString(data.avatar) };
    writeCache(profiles, userId, {
      profile,
      expiresAt: Date.now() + PROFILE_TTL_MS,
    });
    return profile;
  })()
    .catch(() => null)
    .finally(() => profileRequests.delete(userId));

  profileRequests.set(userId, request);
  return request;
}

async function readPublicPost(postId: string): Promise<ModalFullPostData | null> {
  const client = getPublicClient();
  const cached = readCache(posts, postId);

  if (cached) {
    // Cache hit KHÔNG đồng nghĩa còn quyền xem. Luôn kiểm tra row public bằng
    // RLS + no-store trước khi render, kể cả Back/Forward hay Router Cache.
    // Không tải content/images/profile khi phiên bản bài chưa thay đổi.
    const { data, error } = await client
      .from("posts")
      .select("id, user_id, visibility, created_at, updated_at")
      .eq("id", postId)
      .eq("visibility", "public")
      .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
      .maybeSingle();

    const revision = getRevision(data, postId);
    if (error || !revision) {
      posts.delete(postId);
      return null; // Mất mạng, bị xóa/đổi privacy: tuyệt đối không show cache cũ.
    }

    if (
      cached.userId === revision.userId &&
      cached.createdAt === revision.createdAt &&
      cached.updatedAt === revision.updatedAt
    ) {
      return cached.post;
    }
    posts.delete(postId);
  }

  // Cache miss: query nội dung public cũng chính là bước kiểm tra quyền đọc;
  // không chạy thêm query version trước đó, không gọi auth.getUser().
  const { data, error } = await client
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("visibility", "public")
    .abortSignal(AbortSignal.timeout(REQUEST_TIMEOUT_MS))
    .maybeSingle();

  const revision = getRevision(data, postId);
  if (error || !revision || !isRecord(data)) return null;

  const profile = await loadPublicProfile(revision.userId);
  const post: ModalFullPostData = {
    id: postId,
    content: typeof data.content === "string" ? data.content : "",
    images: Array.isArray(data.images)
      ? data.images
          .filter((image): image is string => !!getString(image))
          .map((image) => image.trim())
      : [],
    createdAt: revision.createdAt,
    author: {
      name: profile?.name || getString(data.author_name) || "Người dùng",
      avatar: profile?.avatar || getString(data.author_avatar),
    },
  };

  // Chỉ giữ payload cần render, không giữ nguyên record Supabase.
  writeCache(posts, postId, {
    ...revision,
    post,
    expiresAt: Date.now() + POST_TTL_MS,
  });
  return post;
}

/**
 * Dùng riêng cho modal PUBLIC. Promise đang tải được dùng chung theo postId
 * (kể cả StrictMode/đóng-mở nhanh); kết quả lỗi không được cache.
 * Nội dung private không bao giờ được nhận, lưu, hoặc trả từ service này.
 */
export function loadPublicModalPost(
  postId: string
): Promise<ModalFullPostData | null> {
  if (typeof window === "undefined" || !POST_ID_PATTERN.test(postId)) {
    return Promise.resolve(null);
  }

  const pending = postRequests.get(postId);
  if (pending) return pending;

  const request = readPublicPost(postId)
    .catch(() => {
      posts.delete(postId);
      return null;
    })
    .finally(() => postRequests.delete(postId));

  postRequests.set(postId, request);
  return request;
}
