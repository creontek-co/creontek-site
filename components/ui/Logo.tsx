import {
  LOGO_PIECES,
  SYMBOL_VIEWBOX,
  WORDMARK_D,
  WORDMARK_VIEWBOX,
} from "@/lib/logo-paths";

/** The full wordmark. Colour comes from currentColor. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={WORDMARK_VIEWBOX}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={WORDMARK_D} fillRule="evenodd" />
    </svg>
  );
}

/** The symbol, with its three bar tones. */
export function LogoSymbol({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={SYMBOL_VIEWBOX}
      fill="currentColor"
      aria-hidden="true"
    >
      {LOGO_PIECES.map((p, i) => (
        <path key={i} d={p.d} fillOpacity={p.tone} fillRule="evenodd" />
      ))}
    </svg>
  );
}
