

export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }
  return `₹${Math.round(Number(value)).toLocaleString("en-IN")}`;
}

export function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

/** Mongo timestamps arrive as ISO strings. */
export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return `${formatDate(value)}, ${date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function initials(user) {
  const source = user?.name?.trim() || user?.email?.split("@")[0] || "";
  if (!source) return "—";

  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);

  return letters.toUpperCase();
}

export function discountPercent(price, discountPrice) {
  if (!price || !discountPrice || discountPrice >= price) return null;
  return Math.round(((price - discountPrice) / price) * 100);
}


export function formatCompact(value) {
  const number = Number(value ?? 0);
  const abs = Math.abs(number);

  if (abs >= 1e7) return `${trim(number / 1e7)}Cr`;
  if (abs >= 1e5) return `${trim(number / 1e5)}L`;
  if (abs >= 1e3) return `${trim(number / 1e3)}k`;

  return String(Math.round(number));
}

const trim = (value) =>
  value.toFixed(1).replace(/\.0$/, "");

export function formatCompactPrice(value) {
  return `₹${formatCompact(value)}`;
}


export function formatPeriod(period) {
  if (!period) return "—";

  const week = /^(\d{4})-W(\d{2})$/.exec(period);
  if (week) return `W${week[2]} ${week[1]}`;

  const month = /^(\d{4})-(\d{2})$/.exec(period);
  if (month) {
    return new Date(Number(month[1]), Number(month[2]) - 1, 1).toLocaleDateString(
      "en-IN",
      { month: "short", year: "2-digit" },
    );
  }

  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(period);
  if (day) {
    return new Date(
      Number(day[1]),
      Number(day[2]) - 1,
      Number(day[3]),
    ).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  return period;
}

export function formatPercent(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return "—";
  return `${number > 0 ? "+" : ""}${trim(number)}%`;
}
