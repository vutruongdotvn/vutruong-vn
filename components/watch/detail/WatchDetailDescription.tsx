type WatchDetailDescriptionProps = {
  movie: any;
};

export default function WatchDetailDescription({
  movie,
}: WatchDetailDescriptionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Nội dung phim</h2>

      {movie?.content ? (
        <div
          className="prose prose-invert max-w-none prose-p:text-white/75 prose-headings:text-white prose-strong:text-white"
          dangerouslySetInnerHTML={{ __html: movie.content }}
        />
      ) : (
        <p className="text-sm leading-7 text-white/65">
          Hiện chưa có mô tả cho bộ phim này.
        </p>
      )}
    </section>
  );
}