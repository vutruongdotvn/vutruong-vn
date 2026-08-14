import { supabase } from "@/lib/supabase";
import type {
  FeaturedAssetInput,
  FeaturedAssetsPage,
  FeaturedStory,
  FeaturedStoryImage,
} from "@/types/featuredStory";

type StoryRow = Omit<FeaturedStory, "images">;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
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

export async function fetchFeaturedStories(): Promise<FeaturedStory[]> {
  const [storiesResult, imagesResult] = await Promise.all([
    supabase
      .from("featured_stories")
      .select("id, sort_order, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("featured_story_images")
      .select(
        "id, story_id, public_id, secure_url, width, height, format, sort_order, created_at"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (storiesResult.error) {
    throw new Error(storiesResult.error.message);
  }

  if (imagesResult.error) {
    throw new Error(imagesResult.error.message);
  }

  const imagesByStory = new Map<string, FeaturedStoryImage[]>();

  for (const image of (imagesResult.data ?? []) as FeaturedStoryImage[]) {
    const current = imagesByStory.get(image.story_id) ?? [];
    current.push(image);
    imagesByStory.set(image.story_id, current);
  }

  return ((storiesResult.data ?? []) as StoryRow[]).map((story) => ({
    ...story,
    images: imagesByStory.get(story.id) ?? [],
  }));
}

export async function createFeaturedStory(): Promise<FeaturedStory> {
  const { data: lastStory, error: lastStoryError } = await supabase
    .from("featured_stories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastStoryError) {
    throw new Error(lastStoryError.message);
  }

  const { data, error } = await supabase
    .from("featured_stories")
    .insert({ sort_order: (lastStory?.sort_order ?? -1) + 1 })
    .select("id, sort_order, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Không thể tạo Tin nổi bật.");
  }

  return { ...(data as StoryRow), images: [] };
}

export async function addFeaturedImages(
  storyId: string,
  assets: FeaturedAssetInput[]
) {
  const uniqueAssets = Array.from(
    new Map(assets.map((asset) => [asset.public_id, asset])).values()
  );

  if (uniqueAssets.length === 0) return;

  const { data: lastImage, error: lastImageError } = await supabase
    .from("featured_story_images")
    .select("sort_order")
    .eq("story_id", storyId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastImageError) {
    throw new Error(lastImageError.message);
  }

  const startOrder = (lastImage?.sort_order ?? -1) + 1;
  const rows = uniqueAssets.map((asset, index) => ({
    story_id: storyId,
    public_id: asset.public_id,
    secure_url: asset.secure_url,
    width: asset.width ?? null,
    height: asset.height ?? null,
    format: asset.format ?? null,
    sort_order: startOrder + index,
  }));

  const { error } = await supabase.from("featured_story_images").insert(rows);

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ảnh này đã được sử dụng trong Tin nổi bật.");
    }
    throw new Error(error.message);
  }
}

export async function reorderFeaturedImages(
  storyId: string,
  orderedImageIds: string[]
) {
  const updates = orderedImageIds.map((id, sortOrder) =>
    supabase
      .from("featured_story_images")
      .update({ sort_order: sortOrder })
      .eq("id", id)
      .eq("story_id", storyId)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }
}

export async function reorderFeaturedStories(orderedStoryIds: string[]) {
  const updates = orderedStoryIds.map((id, sortOrder) =>
    supabase
      .from("featured_stories")
      .update({ sort_order: sortOrder })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);

  if (failed?.error) {
    throw new Error(failed.error.message);
  }
}

export async function deleteFeaturedImageRecord(imageId: string) {
  const { error } = await supabase
    .from("featured_story_images")
    .delete()
    .eq("id", imageId);

  if (error) throw new Error(error.message);
}

export async function deleteFeaturedStoryRecord(storyId: string) {
  const { error } = await supabase
    .from("featured_stories")
    .delete()
    .eq("id", storyId);

  if (error) throw new Error(error.message);
}

export async function fetchFeaturedCloudinaryAssets(
  cursor?: string | null
): Promise<FeaturedAssetsPage> {
  const token = await getAccessToken();
  const params = new URLSearchParams();

  if (cursor) params.set("cursor", cursor);

  const url = params.size
    ? `/api/featured-images?${params.toString()}`
    : "/api/featured-images";

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || "Không thể tải thư viện ảnh Tin nổi bật.");
  }

  return {
    assets: Array.isArray(result.assets) ? result.assets : [],
    next_cursor:
      typeof result.next_cursor === "string" ? result.next_cursor : null,
  };
}

export async function deleteFeaturedCloudinaryAssets(publicIds: string[]) {
  const uniquePublicIds = [...new Set(publicIds.filter(Boolean))];
  if (uniquePublicIds.length === 0) return;

  const token = await getAccessToken();
  const batches: string[][] = [];

  for (let index = 0; index < uniquePublicIds.length; index += 50) {
    batches.push(uniquePublicIds.slice(index, index + 50));
  }

  for (const batch of batches) {
    const response = await fetch("/api/delete-images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_ids: batch }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Không thể xóa ảnh khỏi Cloudinary.");
    }
  }
}

export function featuredServiceError(error: unknown) {
  return getErrorMessage(error, "Có lỗi xảy ra, vui lòng thử lại.");
}
