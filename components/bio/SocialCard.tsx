export default function SocialCard({
  title,
  subtitle,
  icon,
  href,
  iconBg,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  iconBg?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      className="group flex items-center justify-between p-5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl hover:-translate-y-1 hover:bg-white/90 transition-all duration-300"
    >
      <div className="flex items-center gap-4">

        {/* ICON */}
        <div
          className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${iconBg}`}
        >
          {icon}
        </div>

        {/* TEXT */}
        <div className="flex flex-col justify-center">
          <p className="font-semibold text-gray-900 leading-tight">
            {title}
          </p>
          <p className="text-sm text-gray-500 leading-tight">
            {subtitle}
          </p>
        </div>

      </div>

      <i className="fa-regular fa-arrow-right text-gray-400 group-hover:translate-x-1 group-hover:text-gray-600 transition"></i>
    </a>
  );
}