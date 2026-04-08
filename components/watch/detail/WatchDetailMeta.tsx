type WatchDetailMetaProps = {
  movie: any;
};

export default function WatchDetailMeta({ movie }: WatchDetailMetaProps) {
  const categories = movie?.category?.map((item: any) => item.name).join(" • ");
  const countries = movie?.country?.map((item: any) => item.name).join(" • ");

  const metaItems = [
    movie?.year && `Năm ${movie.year}`,
    movie?.time,
    movie?.episode_current,
    movie?.episode_total && `Tổng ${movie.episode_total}`,
    countries,
    categories,
  ].filter(Boolean);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Thông tin nhanh</h2>

      <div className="flex flex-wrap gap-3">
        {metaItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}