/** The panel's one container: white card, hairline border, optional header. */
export default function Card({
  title,
  subtitle,
  action,
  padded = true,
  className = "",
  children,
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-paper ${className}`}
    >
      {title || action ? (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-[13px] text-mist">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}

      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}
