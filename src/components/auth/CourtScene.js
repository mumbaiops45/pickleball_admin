/**
 * The animated court behind the login brand panel.
 *
 * Purely decorative and purely CSS — every class here is defined in the
 * "Pickleball scene" block of `globals.css`, which also documents the shared
 * 0.8s / 1.6s / 3.2s / 6.4s timing grid the ball and paddles are locked to.
 * Nothing in here takes focus or is read out, hence the single `aria-hidden`
 * on the wrapper.
 */
export default function CourtScene() {
  return (
    <div className="pb-scene" aria-hidden="true">
      <Court />

      <Paddle className="pb-paddle-left" />
      <Paddle className="pb-paddle-right" />

      <span className="pb-hit pb-hit-left" />
      <span className="pb-hit pb-hit-right" />

      <div className="pb-rally">
        <span className="pb-ball-shadow" />
        <span className="pb-hop">
          <span className="pb-squash">
            <Ball />
          </span>
        </span>
      </div>
    </div>
  );
}

/**
 * Top-down court, tilted into the floor by `.pb-court`. The viewBox is in
 * plain units rather than fractions so `stroke-width` stays a sane number
 * once `preserveAspectRatio="none"` stretches the box.
 */
function Court() {
  return (
    <svg viewBox="0 0 400 300" className="pb-court" preserveAspectRatio="none">
      {/* Service boxes, washed in before the lines finish drawing. */}
      <rect className="pb-deck" x="24" y="18" width="352" height="104" />
      <rect className="pb-deck" x="24" y="178" width="352" height="104" />

      {/* Perimeter, then kitchen lines, then the centre service lines. The
          staggered delays make the court assemble rather than blink on. */}
      <rect className="pb-line" pathLength="1" x="24" y="18" width="352" height="264" />
      <path className="pb-line" pathLength="1" d="M24 122H376" style={{ "--d": "0.25s" }} />
      <path className="pb-line" pathLength="1" d="M24 178H376" style={{ "--d": "0.25s" }} />
      <path
        className="pb-line pb-line-soft"
        pathLength="1"
        d="M200 18V122"
        style={{ "--d": "0.5s" }}
      />
      <path
        className="pb-line pb-line-soft"
        pathLength="1"
        d="M200 178V282"
        style={{ "--d": "0.5s" }}
      />

      {/* Net: cord plus a coarse mesh, kept faint so it never fights the copy. */}
      <path className="pb-line" pathLength="1" d="M8 150H392" style={{ "--d": "0.7s" }} />
      <g className="pb-net">
        {Array.from({ length: 25 }, (_, i) => 8 + i * 16).map((x) => (
          <path key={x} d={`M${x} 142V158`} />
        ))}
      </g>
    </svg>
  );
}

/** A pickleball: neon shell, drilled holes, one soft highlight. */
function Ball() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" className="pb-ball">
      <circle cx="20" cy="20" r="19" fill="var(--color-volt)" />
      <circle cx="20" cy="20" r="19" fill="url(#pb-ball-shade)" />
      {[
        [20, 8],
        [30, 14],
        [30, 26],
        [20, 32],
        [10, 26],
        [10, 14],
        [20, 20],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.6" fill="#12141a" opacity="0.55" />
      ))}
      <defs>
        <radialGradient id="pb-ball-shade" cx="0.32" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#12141a" stopOpacity="0.35" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** Paddle silhouette — face, throat and grip, swung by `.pb-paddle`. */
function Paddle({ className = "" }) {
  return (
    <svg viewBox="0 0 60 130" width="58" height="126" className={`pb-paddle ${className}`}>
      <rect
        x="6"
        y="4"
        width="48"
        height="72"
        rx="12"
        fill="var(--color-shell-2)"
        stroke="var(--color-volt)"
        strokeOpacity="0.55"
        strokeWidth="2"
      />
      <rect x="10" y="8" width="40" height="64" rx="9" fill="var(--color-volt)" opacity="0.1" />
      <path d="M24 74h12v14H24z" fill="var(--color-shell-line)" />
      <rect
        x="23"
        y="86"
        width="14"
        height="40"
        rx="7"
        fill="var(--color-shell-line)"
        stroke="var(--color-volt)"
        strokeOpacity="0.3"
        strokeWidth="1.5"
      />
    </svg>
  );
}
