/**
 * The panel container: white card, hairline border, optional header and footer.
 *
 * The border does the separating; the shadow underneath it is a single soft
 * pixel, just enough to lift the card off the `surface` background without
 * turning a dense screen into a stack of floating slabs.
 */
export default function Card({
  title,
  subtitle,
  action,
  icon: Icon,
  footer,
  padded = true,
  className = "",
  children,
}) {
  return (
    <section
      className={`flex flex-col rounded-xl border border-line bg-paper shadow-[0_1px_2px_rgb(15_17_21/0.03)] ${className}`}
    >
      {title || action ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {Icon ? (
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-mist">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            ) : null}
            <div className="flex min-w-0 flex-col gap-0.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {title}
              </h2>
              {subtitle ? (
                <p className="text-[13px] leading-snug text-mist">{subtitle}</p>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </header>
      ) : null}

      <div className={`flex-1 ${padded ? "p-5" : ""}`}>{children}</div>

      {footer ? (
        <footer className="border-t border-line px-5 py-3 text-[12.5px] text-mist">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}
