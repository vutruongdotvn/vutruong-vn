export default function WatchLoading() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-6 w-28 rounded-full bg-white/10" />
          <div className="mt-6 h-10 w-80 rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-full max-w-2xl rounded-lg bg-white/10" />
          <div className="mt-2 h-5 w-full max-w-xl rounded-lg bg-white/10" />

          <div className="mt-8 h-[80vh] min-h-[700px] rounded-3xl border border-white/10 bg-white/5" />
        </div>
      </div>
    </main>
  );
}