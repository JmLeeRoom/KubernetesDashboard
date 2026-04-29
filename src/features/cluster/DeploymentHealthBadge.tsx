import type { FC } from "react";

import type { DeploymentHealth } from "@/types/cluster";

/**
 * Status pill for Deployment health.
 *
 * Maps a `DeploymentHealth` value to a (color, label) pair. Mapping is kept
 * in a single object so adding a new state (e.g. "paused") is a one-line
 * change. The dot pulses only for "progressing" — using motion as an
 * additional encoding channel for the state most likely to change soon.
 *
 * Accessibility: the colored dot is decorative; the label is the
 * authoritative accessible text. We never communicate state by color
 * alone (DESIGN.md §Components: Status Badges).
 */
export interface DeploymentHealthBadgeProps {
  readonly health: DeploymentHealth;
}

interface BadgeStyle {
  readonly label: string;
  readonly containerClass: string;
  readonly textClass: string;
  readonly dotClass: string;
  /** Whether the dot animates (used for transient states). */
  readonly pulsing: boolean;
}

const STYLES: Record<DeploymentHealth, BadgeStyle> = {
  healthy: {
    label: "HEALTHY",
    containerClass: "bg-surface-bright border-outline-variant",
    textClass: "text-primary-fixed",
    dotClass: "bg-primary-fixed",
    pulsing: true,
  },
  progressing: {
    label: "PROGRESSING",
    containerClass: "bg-surface-bright border-outline-variant",
    textClass: "text-primary",
    dotClass: "bg-primary",
    pulsing: true,
  },
  degraded: {
    label: "DEGRADED",
    containerClass: "bg-error-container/10 border-error-container/30",
    textClass: "text-error",
    dotClass: "bg-error",
    pulsing: false,
  },
  failed: {
    label: "FAILED",
    containerClass: "bg-error-container/20 border-error/40",
    textClass: "text-error",
    dotClass: "bg-error",
    pulsing: false,
  },
  unknown: {
    label: "UNKNOWN",
    containerClass: "bg-surface-container-high border-outline-variant",
    textClass: "text-on-surface-variant",
    dotClass: "bg-on-surface-variant",
    pulsing: false,
  },
};

export const DeploymentHealthBadge: FC<DeploymentHealthBadgeProps> = ({
  health,
}) => {
  const style = STYLES[health];
  return (
    <span
      className={`flex items-center gap-2 rounded-full border px-3 py-1 ${style.containerClass}`}
    >
      <span
        aria-hidden="true"
        className={`relative h-2 w-2 rounded-full ${style.dotClass}`}
      >
        {style.pulsing ? (
          <span
            className={`absolute inset-0 animate-ping rounded-full opacity-20 ${style.dotClass}`}
          />
        ) : null}
      </span>
      <span className={`font-label-caps text-label-caps ${style.textClass}`}>
        {style.label}
      </span>
    </span>
  );
};
