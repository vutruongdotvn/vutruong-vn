export default function FloatingSymbols() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[10%] top-[18%] animate-[floatY_8s_ease-in-out_infinite] text-xl text-black/10">
        ✦
      </div>
      <div className="absolute right-[14%] top-[24%] animate-[floatY_10s_ease-in-out_infinite] text-sm text-black/10">
        &lt;/&gt;
      </div>
      <div className="absolute left-[18%] bottom-[20%] animate-[floatY_9s_ease-in-out_infinite] text-base text-black/10">
        #
      </div>
      <div className="absolute right-[20%] bottom-[16%] animate-[floatY_11s_ease-in-out_infinite] text-lg text-black/10">
        ∞
      </div>
      <div className="absolute left-[48%] top-[12%] animate-[floatY_12s_ease-in-out_infinite] text-sm text-black/10">
        []
      </div>
    </div>
  );
}