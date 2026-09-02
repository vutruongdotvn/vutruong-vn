import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video trên Blog",
  description: "Video trên Blog của Vũ Trường.",
  alternates: {
    canonical: "/blog/videos",
  },
};

export default function BlogVideosPage() {
  return (
    <section className="flex min-h-96 items-center justify-center bg-card px-4 py-16 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-2xl">
      <div className="flex flex-col gap-2 items-center text-muted-foreground">
        <i
          className="fal fa-video-slash mb-3 text-3xl text-muted-foreground"
          aria-hidden="true"
        />
        <h1 className="text-sm font-medium text-foreground/75 sm:text-base">
          Chưa có video nào
        </h1>
      </div>
    </section>
  );
}
