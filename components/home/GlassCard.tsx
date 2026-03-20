export default function GlassCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-lg max-w-screen mx-6 px-10 py-16 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      {children}
    </div>
  );
}