import Link from "next/link";
import { TOPIC_ITEMS } from "@/lib/watch/constants";

export default function WatchTopics() {
  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
        {TOPIC_ITEMS.map((topic) => (
          <Link
            key={`${topic.type}-${topic.slug}`}
            href={`/watch/${topic.type}/${topic.slug}`} prefetch={false}
            className={`group relative overflow-hidden rounded-lg hover:rounded-xl bg-gradient-to-r ${topic.gradient} p-[1px] shadow-[0_10px_35px_rgba(0,0,0,.25)] transition duration-300 hover:-translate-y-0.5`}
          >
              <div className="flex h-full flex-col justify-between gap-8 px-6 py-4">
                <h3 className="text-base font-bold leading-snug text-white">
                  {topic.label}
                </h3>

                <p className="text-[13px] font-medium text-white/75 group-hover:text-white/90">
                  Xem chủ đề <i className="fa-duotone fa-arrow-right"/>
                </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}