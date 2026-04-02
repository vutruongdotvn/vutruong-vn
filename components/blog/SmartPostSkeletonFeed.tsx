import PostCardSkeleton from "./PostCardSkeleton";

type Variant = "text" | "single" | "double" | "grid";
type Mode = "initial" | "loadMore";

type SmartPostSkeletonFeedProps = {
  mode?: Mode;
  className?: string;
};

const INITIAL_PATTERNS: Variant[][] = [
  ["single", "text", "grid"],
  ["text", "single", "double"],
  ["grid", "text", "single"],
];

const LOAD_MORE_PATTERNS: Variant[][] = [
  ["double", "single"],
  ["text", "single"],
  ["single", "double"],
];

function getDailySeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function pickPattern(mode: Mode) {
  const seed = getDailySeed();

  if (mode === "initial") {
    return INITIAL_PATTERNS[seed % INITIAL_PATTERNS.length];
  }

  return LOAD_MORE_PATTERNS[seed % LOAD_MORE_PATTERNS.length];
}

export default function SmartPostSkeletonFeed({
  mode = "initial",
  className = "",
}: SmartPostSkeletonFeedProps) {
  const pattern = pickPattern(mode);

  return (
    <div className={`space-y-3 sm:space-y-6 mb-3 sm:mb-6 w-full ${className}`}>
      {pattern.map((variant, index) => (
        <PostCardSkeleton
          key={`${mode}-${variant}-${index}`}
          variant={variant}
          isLast={index === pattern.length - 1}
        />
      ))}
    </div>
  );
}