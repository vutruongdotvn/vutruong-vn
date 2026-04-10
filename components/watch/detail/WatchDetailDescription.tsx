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
          className="text-white/90"
          dangerouslySetInnerHTML={{ __html: movie.content }}
        />
      ) : (
        <div className="text-sm text-white/75">
          Hiện chưa có mô tả cho bộ phim này.
        </div>
      )}
    </section>
  );
}