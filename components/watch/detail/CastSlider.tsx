"use client";

type Actor =
  | string
  | {
      name: string;
      thumb_url?: string;
      character?: string;
      known_for_department?: string;
      profile_path?: string;
    };

const TMDB_CDN = "https://image.tmdb.org/t/p/w185";
const OPHIM_CDN = "https://ophim1.com";

function getAvatar(actor: any, name: string) {
  if (actor?.profile_path) {
    return `${TMDB_CDN}${actor.profile_path}`;
  }

  if (actor?.thumb_url) {
    if (actor.thumb_url.startsWith("http")) return actor.thumb_url;
    return `${OPHIM_CDN}${actor.thumb_url}`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=111827&color=fff`;
}

function getDepartmentLabel(dep?: string) {
  switch (dep) {
    case "Acting":
      return "Diễn viên";
    case "Directing":
      return "Đạo diễn";
    case "Production":
      return "Nhà sản xuất";
    case "Sound":
      return "Âm thanh";
    case "Writing":
      return "Biên kịch";
    default:
      return dep || "";
  }
}

export default function CastSlider({
  actors = [],
}: {
  actors: Actor[];
}) {
  if (!actors.length) return null;

  // ✅ 1. TÁCH CAST / CREW
  const cast = actors.filter(
    (a: any) => typeof a !== "string" && a.known_for_department === "Acting"
  );

  const crew = actors.filter(
    (a: any) => typeof a !== "string" && a.known_for_department !== "Acting"
  );

  // fallback nếu toàn string
  const fallback = actors.filter((a) => typeof a === "string");

  const renderGrid = (list: Actor[], isCast = false) => (
    <div
      className="
        grid gap-3
        grid-cols-3
        sm:grid-cols-4
        md:grid-cols-5
        lg:grid-cols-6
        xl:grid-cols-8
      "
    >
      {list.slice(0, 16).map((actor, index) => {
        const isString = typeof actor === "string";

        const name = isString ? actor : actor.name;

        const avatar = isString
          ? getAvatar(null, name)
          : getAvatar(actor, name);

        const character = !isString ? actor.character?.trim() : "";
        const role = !isString
          ? getDepartmentLabel(actor.known_for_department)
          : "";

        return (
          <div
            key={index}
            className="group text-center cursor-pointer"
          >
            {/* IMAGE */}
            <div className="relative overflow-hidden rounded-xl bg-white/5">
              <div className="aspect-[3/4] w-full overflow-hidden">
                <img
                  src={avatar}
                  alt={name}
                  loading="lazy"
                  className="
                    h-full w-full object-cover
                    transition duration-300
                    group-hover:scale-105
                  "
                />
              </div>

              {/* ✅ 4. HOVER OVERLAY XỊN */}
              <div className="absolute inset-0 bg-black/70 opacity-0 transition duration-300 group-hover:opacity-100 flex flex-col justify-end p-2">
                {/* character */}
                {character && (
                  <p className="text-[11px] text-white line-clamp-2">
                    {character}
                  </p>
                )}

                {/* role */}
                {role && (
                  <p className="text-[10px] text-white/70 uppercase">
                    {role}
                  </p>
                )}
              </div>
            </div>

            {/* NAME */}
            <p
              className={`
                mt-2 px-1 text-xs sm:text-sm font-semibold line-clamp-1
                ${isCast ? "text-white truncate" : "text-white truncate"}
              `}
            >
              {name}
            </p>

            {/* ✅ 2. ẨN DATA RÁC */}
            {!character && role && (
              <p className="text-[10px] text-white/40 uppercase">
                {role}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl space-y-6">
      {/* ✅ CAST */}
      {cast.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Diễn viên
          </h2>
          {renderGrid(cast, true)}
        </div>
      )}

      {/* ✅ CREW */}
      {crew.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Đội ngũ sản xuất
          </h2>
          {renderGrid(crew, false)}
        </div>
      )}

      {/* fallback */}
      {!cast.length && !crew.length && fallback.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Diễn viên
          </h2>
          {renderGrid(fallback, true)}
        </div>
      )}
    </section>
  );
}