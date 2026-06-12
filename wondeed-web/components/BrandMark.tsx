/**
 * Wondeed brand mark — a rounded square with a clipped top-right corner
 * (the "clip" motif) and a bold W stroke. One component, used everywhere:
 * marketing nav/footer, immersive chrome, auth pages, dashboards.
 */
export default function BrandMark({
  size = 28,
  radius = 7,
}: {
  size?: number
  radius?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ borderRadius: radius, display: 'block', flexShrink: 0 }}
    >
      {/* square with the top-right corner clipped off */}
      <path
        d="M8 0 H19.5 L32 12.5 V24 a8 8 0 0 1 -8 8 H8 a8 8 0 0 1 -8 -8 V8 a8 8 0 0 1 8 -8 Z"
        fill="#0A0E27"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1"
      />
      {/* the cut line */}
      <path d="M19.5 0 L32 12.5" stroke="#00D26A" strokeWidth="2.4" />
      {/* the clipped-off corner, drifting away */}
      <path d="M24.5 1.5 L30.5 7.5 L24.5 7.5 Z" fill="#00D26A" opacity="0.55" />
      {/* W */}
      <path
        d="M7.5 12 L11 23 L16 14.5 L21 23 L24.5 12"
        stroke="#00D26A"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
