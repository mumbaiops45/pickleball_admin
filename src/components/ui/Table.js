
export function Table({ children, minWidth = "42rem", className = "" }) {
  return (
    <div className={`scroll-x -mx-4 px-4 sm:-mx-5 sm:px-5 ${className}`}>
      <table
        className="w-full border-collapse text-left"
 
        style={{ minWidth }}
      >
        {children}
      </table>
    </div>
  );
}


export function TableOrCards({ cards, minWidth, children }) {
  return (
    <>
      <div className="md:hidden">{cards}</div>
      <div className="hidden md:block">
        <Table minWidth={minWidth}>{children}</Table>
      </div>
    </>
  );
}

/** The phone-shaped list a <TableOrCards> falls back to. */
export function Records({ children }) {
  return <ul className="flex flex-col gap-2.5">{children}</ul>;
}


export function Record({ media, title, subtitle, badges, actions, children }) {
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-line bg-paper p-3.5 shadow-[0_1px_2px_rgb(15_17_21/0.03)]">
      <div className="flex items-start gap-3">
        {media}

    
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="break-anywhere text-[14px] font-medium leading-snug text-ink">
            {title}
          </div>
          {subtitle ? (
            <div className="break-anywhere text-[12px] leading-snug text-mist">
              {subtitle}
            </div>
          ) : null}
        </div>

        {badges ? (
          <span className="flex shrink-0 flex-col items-end gap-1">{badges}</span>
        ) : null}
      </div>

      {children ? (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-line pt-3">
          {children}
        </dl>
      ) : null}

      {actions ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
          {actions}
        </div>
      ) : null}
    </li>
  );
}

/** A label/value pair inside a <Record>. `wide` spans both columns. */
export function RecordField({ label, wide = false, children }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">
        {label}
      </dt>
      <dd className="break-anywhere text-[13px] leading-snug text-ink">
        {children}
      </dd>
    </div>
  );
}

export function Th({ align = "left", className = "", children }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-line pb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-mist ${
        align === "right" ? "text-right" : ""
      } ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ align = "left", className = "", children, ...rest }) {
  return (
    <td
      className={`border-b border-line py-3 pr-4 align-middle text-sm last:pr-0 ${
        align === "right" ? "text-right" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

export function Tr({ className = "", children, ...rest }) {
  return (
    <tr className={`transition-colors hover:bg-surface/70 ${className}`} {...rest}>
      {children}
    </tr>
  );
}
