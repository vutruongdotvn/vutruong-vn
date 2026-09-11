import type { WatchCountryFlagCode } from "@/lib/watch/watchDirectory";

const STAR = "16,4.4 17.8,9.2 22.9,9.4 18.9,12.5 20.3,17.4 16,14.6 11.7,17.4 13.1,12.5 9.1,9.4 14.2,9.2";

function clipId(code: WatchCountryFlagCode) {
  return `watch-country-flag-${code}`;
}

export default function WatchCountryFlag({ code }: { code: WatchCountryFlagCode }) {
  const clip = clipId(code);

  return (
    <svg
      viewBox="0 0 32 22"
      className="block h-[1.35rem] w-[1.95rem] rounded-[.28rem] shadow-[0_1px_3px_rgb(0_0_0_/_0.16)]"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clip}>
          <rect width="32" height="22" rx="3.4" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clip})`}>
        {code === "gb" && (
          <>
            <rect width="32" height="22" fill="#22438b" />
            <path d="M0 0 32 22M32 0 0 22" stroke="#fff" strokeWidth="5" />
            <path d="M0 0 32 22M32 0 0 22" stroke="#c8102e" strokeWidth="2" />
            <path d="M16 0v22M0 11h32" stroke="#fff" strokeWidth="7" />
            <path d="M16 0v22M0 11h32" stroke="#c8102e" strokeWidth="3.5" />
          </>
        )}

        {code === "cn" && (
          <>
            <rect width="32" height="22" fill="#de2910" />
            <polygon points="7.4,4.2 8.4,6.8 11.2,6.9 9,8.6 9.8,11.3 7.4,9.7 5,11.3 5.8,8.6 3.6,6.9 6.4,6.8" fill="#ffde00" />
          </>
        )}

        {code === "id" && (
          <>
            <rect width="32" height="11" fill="#ce1126" />
            <rect y="11" width="32" height="11" fill="#fff" />
          </>
        )}

        {code === "vn" && (
          <>
            <rect width="32" height="22" fill="#da251d" />
            <polygon points={STAR} fill="#ffdf00" transform="translate(0 .2) scale(.72) translate(6.2 4.1)" />
          </>
        )}

        {code === "fr" && (
          <>
            <rect width="10.67" height="22" fill="#0055a4" />
            <rect x="10.67" width="10.66" height="22" fill="#fff" />
            <rect x="21.33" width="10.67" height="22" fill="#ef4135" />
          </>
        )}

        {code === "hk" && (
          <>
            <rect width="32" height="22" fill="#de2910" />
            <g fill="#fff" transform="translate(16 11)">
              <ellipse rx="2.1" ry="5" transform="rotate(0) translate(0 -3.2)" />
              <ellipse rx="2.1" ry="5" transform="rotate(72) translate(0 -3.2)" />
              <ellipse rx="2.1" ry="5" transform="rotate(144) translate(0 -3.2)" />
              <ellipse rx="2.1" ry="5" transform="rotate(216) translate(0 -3.2)" />
              <ellipse rx="2.1" ry="5" transform="rotate(288) translate(0 -3.2)" />
              <circle r="1.15" />
            </g>
          </>
        )}

        {code === "kr" && (
          <>
            <rect width="32" height="22" fill="#fff" />
            <circle cx="16" cy="11" r="5" fill="#cd2e3a" />
            <path d="M11 11a5 5 0 0 0 10 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 0-5 0Z" fill="#0047a0" />
            <g stroke="#111" strokeWidth="1.15">
              <path d="M5 5.5h5M5 7.5h5M5 9.5h5M22 12.5h5M22 14.5h5M22 16.5h5" />
            </g>
          </>
        )}

        {code === "jp" && (
          <>
            <rect width="32" height="22" fill="#fff" />
            <circle cx="16" cy="11" r="5.2" fill="#bc002d" />
          </>
        )}

        {code === "th" && (
          <>
            <rect width="32" height="22" fill="#a51931" />
            <rect y="3.7" width="32" height="14.6" fill="#f4f5f8" />
            <rect y="7" width="32" height="8" fill="#2d2a4a" />
          </>
        )}

        {code === "tw" && (
          <>
            <rect width="32" height="22" fill="#fe0000" />
            <rect width="14" height="11" fill="#000095" />
            <circle cx="7" cy="5.5" r="3.1" fill="#fff" />
            <circle cx="7" cy="5.5" r="1.6" fill="#000095" />
          </>
        )}

        {code === "ru" && (
          <>
            <rect width="32" height="7.34" fill="#fff" />
            <rect y="7.34" width="32" height="7.33" fill="#0039a6" />
            <rect y="14.67" width="32" height="7.33" fill="#d52b1e" />
          </>
        )}

        {code === "nl" && (
          <>
            <rect width="32" height="7.34" fill="#ae1c28" />
            <rect y="7.34" width="32" height="7.33" fill="#fff" />
            <rect y="14.67" width="32" height="7.33" fill="#21468b" />
          </>
        )}

        {code === "ph" && (
          <>
            <rect width="32" height="11" fill="#0038a8" />
            <rect y="11" width="32" height="11" fill="#ce1126" />
            <path d="M0 0 13.2 11 0 22Z" fill="#fff" />
            <circle cx="4.6" cy="11" r="1.9" fill="#fcd116" />
          </>
        )}

        {code === "in" && (
          <>
            <rect width="32" height="7.34" fill="#ff9933" />
            <rect y="7.34" width="32" height="7.33" fill="#fff" />
            <rect y="14.67" width="32" height="7.33" fill="#138808" />
            <circle cx="16" cy="11" r="2.8" fill="none" stroke="#000080" strokeWidth=".85" />
            <circle cx="16" cy="11" r=".55" fill="#000080" />
          </>
        )}
      </g>

      <rect width="32" height="22" rx="3.4" fill="none" stroke="rgb(0 0 0 / .12)" />
    </svg>
  );
}
