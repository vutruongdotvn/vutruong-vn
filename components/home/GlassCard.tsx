export default function GlassCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative max-w-screen mx-4 px-12 py-16 rounded-0 md:rounded-xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      {children}
    </div>
  );
}