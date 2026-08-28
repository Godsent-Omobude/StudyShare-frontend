// Reusable "equalizer bars" loading indicator: 5 vertical bars that pulse
// in height on a staggered delay, like an audio equalizer. Bars are colored
// with currentColor, so they inherit the app's theme text/accent color
// wherever they're placed (works on light backgrounds, dark mode, and on
// solid accent-colored buttons alike — no hardcoded hex). Pass `label` for
// accompanying text (e.g. "Signing in…") rendered next to the bars.
const BAR_COUNT = 5;
const STAGGER_MS = 120;

export default function EqualizerLoader({ label, size = "md", className = "" }) {
  return (
    <span
      className={`equalizer-loader equalizer-loader--${size} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span className="equalizer-loader__bars" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }).map((_, index) => (
          <span
            key={index}
            className="equalizer-loader__bar"
            style={{ animationDelay: `${index * STAGGER_MS}ms` }}
          />
        ))}
      </span>
      {label ? (
        <span className="equalizer-loader__label">{label}</span>
      ) : (
        <span className="sr-only">Loading…</span>
      )}
    </span>
  );
}
