import type { CSSProperties, FC } from "react";

/**
 * Thin wrapper around the Material Symbols Outlined web font.
 *
 * The whole app standardizes on Material Symbols (loaded in `index.html`) so
 * that icon names map 1:1 with the design reference. We expose a typed
 * component instead of letting consumers type the class name string by hand
 * to avoid drift.
 */
export interface MaterialIconProps {
  /** Material Symbols ligature, e.g. "dashboard", "hub", "warning". */
  readonly name: string;
  /** Optional pixel size override. */
  readonly sizePx?: number;
  /** Whether the glyph should be filled (FILL axis = 1). */
  readonly filled?: boolean;
  /** Additional Tailwind classes for color, alignment, etc. */
  readonly className?: string;
  /** Mark as decorative when paired with adjacent text. Default true. */
  readonly decorative?: boolean;
  /** Accessible label when the icon stands alone (decorative=false). */
  readonly ariaLabel?: string;
}

export const MaterialIcon: FC<MaterialIconProps> = ({
  name,
  sizePx,
  filled = false,
  className,
  decorative = true,
  ariaLabel,
}) => {
  const style: CSSProperties = {
    ...(sizePx ? { fontSize: `${sizePx}px` } : null),
    ...(filled ? { fontVariationSettings: "'FILL' 1" } : null),
  };

  if (decorative) {
    return (
      <span
        aria-hidden="true"
        className={`material-symbols-outlined ${className ?? ""}`.trim()}
        style={style}
      >
        {name}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={ariaLabel ?? name}
      className={`material-symbols-outlined ${className ?? ""}`.trim()}
      style={style}
    >
      {name}
    </span>
  );
};
