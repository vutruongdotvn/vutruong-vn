export default function Loading() {
  return (
    <main
      className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-28 pt-20 md:pb-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="rounded-full border border-border bg-card/70 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.06)] backdrop-blur-xl">
        <span className="relative block size-7" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-2 border-foreground/10" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary" />
        </span>

        <span className="sr-only">Đang mở trang</span>
      </div>
    </main>
  );
}
