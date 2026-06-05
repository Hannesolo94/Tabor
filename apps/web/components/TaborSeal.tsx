// TaborIconSeal ported from tabor-mark.jsx (the coin-seal: halo rings, gothic
// cross, three lights of the Transfiguration, Mount Tabor). SVG, brand-faithful.

export function TaborSeal({ id = "ic", size = 200 }: { id?: string; size?: number }) {
  return (
    <svg viewBox="0 0 240 240" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`${id}-au`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6EAC2" />
          <stop offset="30%" stopColor="#DCC07A" />
          <stop offset="48%" stopColor="#BE9A45" />
          <stop offset="50%" stopColor="#8E6A24" />
          <stop offset="53%" stopColor="#B08A37" />
          <stop offset="72%" stopColor="#E8D08C" />
          <stop offset="100%" stopColor="#9C7A30" />
        </linearGradient>
        <radialGradient id={`${id}-seal`} cx="42%" cy="36%" r="66%">
          <stop offset="0%" stopColor="#F6EAC2" />
          <stop offset="58%" stopColor="#C9A961" />
          <stop offset="100%" stopColor="#7E5A1E" />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="116" fill="none" stroke={`url(#${id}-au)`} strokeWidth="2" opacity="0.85" />
      <circle cx="120" cy="120" r="108" fill="none" stroke="#9AA3AF" strokeWidth="0.8" opacity="0.3" />
      <circle cx="120" cy="120" r="100" fill="none" stroke={`url(#${id}-au)`} strokeWidth="1.2" opacity="0.6" />
      <g stroke={`url(#${id}-au)`} strokeWidth="3.4" strokeLinecap="round">
        <path d="M120,44 L120,72 M108,56 L132,56 M112,50 L128,50" />
      </g>
      <circle cx="104" cy="92" r="2.6" fill="#F6EAC2" />
      <circle cx="120" cy="84" r="3.2" fill="#F6EAC2" />
      <circle cx="136" cy="92" r="2.6" fill="#F6EAC2" />
      <path d="M70,176 L104,116 L120,140 L140,108 L172,176 Z" fill={`url(#${id}-seal)`} stroke="#3A2A0A" strokeWidth="1" />
      <path d="M104,116 L114,132 L107,140 L98,128 Z" fill="#FBF1CF" opacity="0.7" />
      <path d="M140,108 L152,128 L145,136 L134,120 Z" fill="#FBF1CF" opacity="0.7" />
      <line x1="70" y1="176" x2="172" y2="176" stroke={`url(#${id}-au)`} strokeWidth="2" />
    </svg>
  );
}
