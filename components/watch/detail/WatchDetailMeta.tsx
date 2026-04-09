type WatchDetailMetaProps = {
  movie: any;
};

export default function WatchDetailMeta({ movie }: WatchDetailMetaProps) {
  const metaItems = [
    movie?.year ? `Năm ${movie.year}` : null,
    movie?.time ?? null,
    movie?.episode_current ?? null,
    movie?.episode_total ? `Tổng ${movie.episode_total}` : null,
    ...(movie?.country?.map((item: any) => item.name) ?? []),
    ...(movie?.category?.map((item: any) => item.name) ?? []),
  ].filter(Boolean);

  const badgeColors = [
    "border-emerald-300/35 bg-emerald-400/15 text-emerald-200 shadow-[0_0_22px_rgba(52,211,153,0.22)] hover:bg-emerald-400/22",
    "border-sky-300/35 bg-sky-400/15 text-sky-200 shadow-[0_0_22px_rgba(56,189,248,0.22)] hover:bg-sky-400/22",
    "border-violet-300/35 bg-violet-400/15 text-violet-200 shadow-[0_0_22px_rgba(167,139,250,0.22)] hover:bg-violet-400/22",
    "border-fuchsia-300/35 bg-fuchsia-400/15 text-fuchsia-200 shadow-[0_0_22px_rgba(232,121,249,0.22)] hover:bg-fuchsia-400/22",
    "border-rose-300/35 bg-rose-400/15 text-rose-200 shadow-[0_0_22px_rgba(251,113,133,0.22)] hover:bg-rose-400/22",
    "border-cyan-300/35 bg-cyan-400/15 text-cyan-200 shadow-[0_0_22px_rgba(34,211,238,0.22)] hover:bg-cyan-400/22",
    "border-amber-300/35 bg-amber-400/15 text-amber-200 shadow-[0_0_22px_rgba(251,191,36,0.22)] hover:bg-amber-400/22",
    "border-lime-300/35 bg-lime-400/15 text-lime-200 shadow-[0_0_22px_rgba(163,230,53,0.22)] hover:bg-lime-400/22",
    "border-pink-300/35 bg-pink-400/15 text-pink-200 shadow-[0_0_22px_rgba(244,114,182,0.22)] hover:bg-pink-400/22",
    "border-indigo-300/35 bg-indigo-400/15 text-indigo-200 shadow-[0_0_22px_rgba(129,140,248,0.22)] hover:bg-indigo-400/22",
    "border-orange-300/35 bg-orange-400/15 text-orange-200 shadow-[0_0_22px_rgba(251,146,60,0.22)] hover:bg-orange-400/22",
    "border-teal-300/35 bg-teal-400/15 text-teal-200 shadow-[0_0_22px_rgba(45,212,191,0.22)] hover:bg-teal-400/22",
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Thông tin nhanh</h2>

      <div className="flex flex-wrap gap-3">
        {metaItems.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className={`rounded-2xl border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] ${badgeColors[index % badgeColors.length]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}