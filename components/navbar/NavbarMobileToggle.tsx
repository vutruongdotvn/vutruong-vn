"use client";

type NavbarMobileToggleProps = {
  open: boolean;
  onToggle: () => void;
};

export default function NavbarMobileToggle({
  open,
  onToggle,
}: NavbarMobileToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="
        relative z-10 md:hidden w-11 h-11 flex items-center justify-center rounded-full
        border border-gray-100 bg-white/75 hover:bg-white
        transition-all duration-300 text-gray-700 hover:text-black cursor-pointer
      "
      aria-label="Open menu"
      aria-expanded={open}
    >
      <i
        className={`fa-duotone transition-all duration-300 ${
          open ? "fa-xmark text-[18px] rotate-90" : "fa-bars text-[18px]"
        }`}
      />
    </button>
  );
}