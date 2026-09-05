export function Mascot({ size = 120, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Маскот Дуодуо"
    >
      <ellipse cx="50" cy="92" rx="26" ry="4" fill="#00000018" />
      <path d="M38 12 L44 22 L34 22 Z" fill="#46A302" />
      <path d="M62 12 L66 22 L56 22 Z" fill="#46A302" />
      <ellipse cx="50" cy="54" rx="38" ry="37" fill="#58CC02" stroke="#46A302" strokeWidth="4" />
      <ellipse cx="50" cy="66" rx="23" ry="19" fill="#89E219" />
      <circle cx="36" cy="43" r="11.5" fill="#fff" stroke="#3C3C3C" strokeWidth="1.5" />
      <circle cx="64" cy="43" r="11.5" fill="#fff" stroke="#3C3C3C" strokeWidth="1.5" />
      <circle cx="39" cy="44" r="5" fill="#3C3C3C" />
      <circle cx="61" cy="44" r="5" fill="#3C3C3C" />
      <circle cx="41" cy="41.5" r="1.8" fill="#fff" />
      <circle cx="63" cy="41.5" r="1.8" fill="#fff" />
      <path d="M44 53 Q50 49 56 53 L50 61 Z" fill="#FF9600" stroke="#E08600" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 55 Q18 68 30 70 Q20 74 13 66 Z" fill="#46A302" />
      <path d="M87 55 Q82 68 70 70 Q80 74 87 66 Z" fill="#46A302" />
      <ellipse cx="41" cy="90" rx="6" ry="3" fill="#FFC800" stroke="#E6AC00" strokeWidth="1.5" />
      <ellipse cx="59" cy="90" rx="6" ry="3" fill="#FFC800" stroke="#E6AC00" strokeWidth="1.5" />
    </svg>
  )
}
