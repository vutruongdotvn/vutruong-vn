type WatchDetailInfoGridProps = {
  movie: any;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!value) return null;

  return (
    <div className="border-b border-white/10 py-3 last:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wide text-white/40">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-white/85">{value}</p>
    </div>
  );
}

export default function WatchDetailInfoGrid({
  movie,
}: WatchDetailInfoGridProps) {
  const directors =
    movie?.director?.length > 0 ? movie.director.join(", ") : null;
  const actors = movie?.actor?.length > 0 ? movie.actor.join(", ") : null;
  const categories = movie?.category?.map((item: any) => item.name).join(", ");
  const countries = movie?.country?.map((item: any) => item.name).join(", ");

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Thông tin khác</h2>

      <div>
        <InfoRow label="Trạng thái" value={movie?.status} />
        <InfoRow label="Thể loại" value={categories} />
        <InfoRow label="Quốc gia" value={countries} />
        <InfoRow label="Đạo diễn" value={directors} />
        <InfoRow label="Diễn viên" value={actors} />
      </div>
    </section>
  );
}