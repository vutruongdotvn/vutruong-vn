export default function ProjectCard({
  name,
  description,
  href,
  icon,
  gradient,
}: {
  name: string;
  description: string;
  href: string;
  icon: string;
  gradient: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      className="group block p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 transition-all duration-300"
    >
      <div className="flex items-center gap-4">

        {/* ICON */}
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white text-2xl shadow-inner shrink-0`}
        >
          <i className={icon} />
        </div>

        {/* TEXT */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900 leading-tight">
            {name}
          </p>
          <p className="text-sm text-gray-500 leading-tight mt-1">
            {description}
          </p>
        </div>

        {/* ARROW */}
        <i className="fa-duotone fa-arrow-up-right text-gray-400 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-gray-600 transition" />
      </div>
    </a>
  );
}