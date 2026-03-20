export default function GlassCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-[420px] p-10 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
      {children}
    </div>
  );
}