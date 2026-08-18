/**
 * Table shell. Tables are the panel's main surface, so the horizontal scroll,
 * the sticky-looking header and the row rhythm are defined once here.
 *
 * The wrapper scrolls rather than the page, so a wide table never pushes the
 * whole layout sideways on a narrow screen.
 */
export function Table({ children, className = "" }) {
  return (
    <div className={`-mx-5 overflow-x-auto px-5 ${className}`}>
      <table className="w-full min-w-[42rem] border-collapse text-left">
        {children}
      </table>
    </div>
  );
}

export function Th({ align = "left", className = "", children }) {
  return (
    <th
      scope="col"
      className={`border-b border-line pb-2.5 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-mist ${
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
