import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;

  const cleanTag = decodeURIComponent(tag).trim().toLowerCase();
  const displayTag = cleanTag.startsWith("#") ? cleanTag : `#${cleanTag}`;

  return {
    title: `Hashtag: ${displayTag}`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function BlogTagLayout({ children }: Props) {
  return <>{children}</>;
}