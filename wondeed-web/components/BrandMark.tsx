export default function BrandMark({
  size = 28,
  radius: _radius = 7,
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
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path
        d="M6 0 H21 L32 11 V26 a6 6 0 0 1 -6 6 H6 a6 6 0 0 1 -6 -6 V6 a6 6 0 0 1 6 -6 Z"
        fill="#0A0E27"
      />
      <path
        d="M21 0 L32 11"
        stroke="#00D26A"
        strokeWidth="2"
        strokeLinecap="square"
      />
      <path
        d="M6 10 L10 22 L16 16 L22 22 L26 10"
        stroke="#00D26A"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
