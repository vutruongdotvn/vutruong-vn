import type { Metadata } from "next";
import type { ReactNode } from "react";

type BlogTagLayoutProps = {
  children: ReactNode;
  params: Promise<{ tag: string }>;
};

function getTagName(rawTag: string) {
  try {
    return decodeURIComponent(rawTag).trim().toLowerCase().replace(/^#+/, "");
  } catch {
    return rawTag.trim().toLowerCase().replace(/^#+/, "");
  }
}

export async function generateMetadata({
  params,
}: Pick<BlogTagLayoutProps, "params">): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tagName = getTagName(rawTag);

  return {
    title: {
      absolute: tagName ? `Tag #${tagName}` : "Tag",
    },
  };
}

export default function BlogTagLayout({ children }: BlogTagLayoutProps) {
  return children;
}