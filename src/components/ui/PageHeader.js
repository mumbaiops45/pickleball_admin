export default function PageHeader({ eyebrow, title, copy, action }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-5">
      <div className="flex max-w-2xl flex-col">
        {eyebrow ? (
          <span className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-volt-deep">
            <span className="h-px w-6 bg-volt-deep/40" />
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-3 text-[clamp(1.6rem,3vw,2.1rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {title}
        </h1>
        {copy ? (
          <p className="mt-2 text-[14px] leading-relaxed text-mist">{copy}</p>
        ) : null}
      </div>


      {action ? (
        <div className="flex shrink-0 flex-wrap gap-2 [&>*]:flex-1 sm:[&>*]:flex-none">
          {action}
        </div>
      ) : null}
    </header>
  );
}
