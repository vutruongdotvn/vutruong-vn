export default function WatchPage() {
  return (
    <main className="h-screen w-screen bg-black overflow-hidden">
      <iframe
        src="https://films.vutruong.vn"
        title="VT Watch"
        className="h-full w-full border-0"
        allow="fullscreen; autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </main>
  );
}