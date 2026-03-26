export default function ContactCard({
  name,
  display,
  href,
  icon,
  gradient,
}: {
  name: string;
  display?: string;
  href: string;
  icon: string;
  gradient: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between p-5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 transition-all duration-300"
    >
      <div className="flex items-center gap-4">

        {/* ICON */}
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white text-lg shadow-inner shrink-0`}
        >
          <i className={icon} />
        </div>

        {/* TEXT */}
        <div className="flex flex-col justify-center">
          <p className="font-semibold text-gray-900 leading-tight">
            {name}
          </p>
          {display && (
            <p className="text-sm text-gray-500 leading-tight">
              {display}
            </p>
          )}
        </div>

      </div>

      {/* Arrow */}
      <i className="fa-duotone fa-arrow-right text-gray-400 group-hover:translate-x-1 group-hover:text-gray-600 transition" />
    </a>
  );
}