import Link from "next/link";
import { TOPIC_ITEMS } from "@/lib/watch/constants";

export default function WatchTopics() {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-white">
          Bạn đang quan tâm gì?
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        {TOPIC_ITEMS.map((topic) => (
          <Link
            key={`${topic.type}-${topic.slug}`}
            href={`/watch/${topic.type}/${topic.slug}`}
            className={`group relative overflow-hidden rounded-[20px] bg-gradient-to-r ${topic.gradient} p-[1px] shadow-[0_10px_35px_rgba(0,0,0,.25)] transition duration-300 hover:-translate-y-0.5`}
          >
            <div className="h-full rounded-[19px] bg-white/10 px-4 py-5 backdrop-blur-[2px]">
              <div className="flex h-full min-h-[62px] flex-col justify-between">
                <h3 className="text-[15px] font-extrabold leading-snug text-white">
                  {topic.label}
                </h3>

                <p className="text-[13px] font-medium text-white/75 group-hover:text-white/90">
                  Xem chủ đề <i className="fa-duotone fa-arrow-right"/>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}