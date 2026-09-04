import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <article className="flex min-h-[20rem] flex-col items-center justify-center rounded-0 bg-card/80 p-4 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md sm:rounded-2xl">
      <i
        className="fa-duotone fa-file-circle-question text-2xl text-red-600 dark:text-red-300"
        aria-hidden="true"
      />

      <h1 className="mt-3 text-lg font-semibold text-red-600 dark:text-red-300">
        Không tìm thấy bài viết
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Bài viết không tồn tại, đã bị xóa hoặc đường dẫn không chính xác.
      </p>

      <Link
        className="mx-auto mt-6 flex w-sm max-w-full items-center justify-center gap-3 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 active:scale-95"
        href="/blog"
      >
        <i className="fad fa-arrow-left" aria-hidden="true" />
        Quay lại Blog
      </Link>
    </article>
  );
}
