import PostCardSkeleton from "./PostCardSkeleton";

type Variant =
  | "text"
  | "single-landscape"
  | "single-portrait"
  | "double-portrait"
  | "double-landscape"
  | "double-mixed"
  | "triple-top-hero"
  | "triple-left-hero"
  | "grid"
  | "grid-more";

type Mode = "initial" | "loadMore";
type TextDensity = "short" | "medium" | "long";

export type SkeletonLayoutItem = {
  variant: Variant;
  isPinned?: boolean;
  textDensity?: TextDensity;
  moreCount?: number;
};

type SmartPostSkeletonFeedProps = {
  mode?: Mode;
  className?: string;
  layouts?: SkeletonLayoutItem[];
};

const DEFAULT_INITIAL_LAYOUTS: SkeletonLayoutItem[] = [
  { variant: "single-landscape", isPinned: true, textDensity: "medium" },
  { variant: "text", textDensity: "short" },
  { variant: "triple-top-hero", textDensity: "long" },
  { variant: "grid", textDensity: "medium" },
];

const DEFAULT_LOAD_MORE_LAYOUTS: SkeletonLayoutItem[] = [
  { variant: "text", textDensity: "medium" },
  { variant: "double-mixed", textDensity: "short" },
];

function getTextDensity(content: string = ""): TextDensity {
  const length = (content || "").trim().length;

  if (length <= 90) return "short";
  if (length <= 220) return "medium";
  return "long";
}

function getRatioFromImage(src: string): number | null {
  if (typeof src !== "string" || !src.trim()) return null;

  // Parse Cloudinary width/height từ URL transform nếu có
  const widthMatch = src.match(/(?:\/|,|^)w_(\d+)(?:,|\/|$)/);
  const heightMatch = src.match(/(?:\/|,|^)h_(\d+)(?:,|\/|$)/);

  const width = widthMatch ? Number(widthMatch[1]) : null;
  const height = heightMatch ? Number(heightMatch[1]) : null;

  if (!width || !height) return null;
  if (height === 0) return null;

  return width / height;
}

function isLandscapeRatio(ratio: number | null) {
  if (ratio == null) return false;
  return ratio >= 1.15;
}

function isPortraitRatio(ratio: number | null) {
  if (ratio == null) return false;
  return ratio <= 0.9;
}

function getPostSkeletonVariant(post: any): Variant {
  const safeImages: string[] = Array.isArray(post?.images)
    ? post.images.filter(
      (img: unknown): img is string =>
        typeof img === "string" && img.trim() !== ""
    )
    : [];

  const count = safeImages.length;

  if (count <= 0) return "text";

  if (count === 1) {
    const ratio = getRatioFromImage(safeImages[0]);
    if (ratio != null && ratio < 1) return "single-portrait";
    return "single-landscape";
  }

  if (count === 2) {
    const ratio1 = getRatioFromImage(safeImages[0]);
    const ratio2 = getRatioFromImage(safeImages[1]);

    const firstPortrait = isPortraitRatio(ratio1);
    const secondPortrait = isPortraitRatio(ratio2);

    const firstLandscape = isLandscapeRatio(ratio1);
    const secondLandscape = isLandscapeRatio(ratio2);

    if (firstPortrait && secondPortrait) return "double-portrait";
    if (firstLandscape && secondLandscape) return "double-landscape";
    return "double-mixed";
  }

  if (count === 3) {
    const hasLandscape = safeImages.some((img) =>
      isLandscapeRatio(getRatioFromImage(img))
    );

    return hasLandscape ? "triple-top-hero" : "triple-left-hero";
  }

  if (count === 4) return "grid";
  return "grid-more";
}

export function buildSkeletonLayoutsFromPosts(posts: any[] = []): SkeletonLayoutItem[] {
  return posts.map((post) => {
    const safeImages: string[] = Array.isArray(post?.images)
      ? post.images.filter(
        (img: unknown): img is string =>
          typeof img === "string" && img.trim() !== ""
      )
      : [];

    return {
      variant: getPostSkeletonVariant(post),
      isPinned: !!post?.is_pinned,
      textDensity: getTextDensity(post?.content || ""),
      moreCount: safeImages.length > 4 ? safeImages.length - 4 : 0,
    };
  });
}

export default function SmartPostSkeletonFeed({
  mode = "initial",
  className = "",
  layouts,
}: SmartPostSkeletonFeedProps) {
  const pattern =
    layouts && layouts.length > 0
      ? layouts
      : mode === "initial"
        ? DEFAULT_INITIAL_LAYOUTS
        : DEFAULT_LOAD_MORE_LAYOUTS;

  return (
    <div className={`space-y-1 sm:space-y-4 mb-3 w-full ${className}`}>
      {pattern.map((item, index) => (
        <PostCardSkeleton
          key={`${mode}-${item.variant}-${item.isPinned ? "pinned" : "normal"}-${item.textDensity ?? "medium"}-${item.moreCount ?? 0}-${index}`}
          variant={item.variant}
          isPinned={item.isPinned}
          textDensity={item.textDensity}
          moreCount={item.moreCount}
          isLast={index === pattern.length - 1}
        />
      ))}
    </div>
  );
}