export function createMetadata({
  title,
  description,
  image,
}: {
  title: string;
  description?: string;
  image?: string;
}) {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image || "/og.png"],
    },
  };
}