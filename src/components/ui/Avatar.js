import { initials } from "@/lib/format";

const SIZES = {
  sm: "size-8 text-[11px]",
  md: "size-9 text-[12px]",
  lg: "size-12 text-sm",
};

/**
 * Initials avatar. The API stores no profile image, so there is no `<img>`
 * fallback path to maintain.
 */
export default function Avatar({ user, size = "md", className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-volt font-semibold tracking-[0.04em] text-ink ${SIZES[size]} ${className}`}
    >
      {initials(user)}
    </span>
  );
}
