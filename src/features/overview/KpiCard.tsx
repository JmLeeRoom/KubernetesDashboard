import type { FC, ReactNode } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Generic KPI card layout.
 *
 * The Overview page uses four KPI cards (nodes, pods, CPU, memory). All four
 * share the same skeleton: small caps label + leading icon, a primary value
 * with a quiet auxiliary suffix, and a slim footer slot for either a
 * progress bar or a trend chip.
 *
 * Decoupling the layout from each card's specific data source keeps the
 * Overview page composable: when each KPI is wired to its real data shape
 * (`NodeReadinessKpi`, `PodCountKpi`, `ResourceUsageKpi`), only the
 * children passed into the `footer` slot change.
 */
export interface KpiCardProps {
  readonly label: string;
  readonly icon: string;
  readonly children: ReactNode;
  /**
   * Optional bottom slot. Common patterns:
   *  - capacity gauge (1px-tall progress bar)
   *  - trend chip (delta arrow + percent + "vs last hour")
   * Left empty in the shell.
   */
  readonly footer?: ReactNode;
}

export const KpiCard: FC<KpiCardProps> = ({
  label,
  icon,
  children,
  footer,
}) => {
  return (
    <article className="relative overflow-hidden rounded-lg border border-panel-border bg-panel-bg p-4">
      <header className="mb-4 flex items-start justify-between">
        <span className="font-label-caps text-label-caps text-on-surface-variant">
          {label}
        </span>
        <MaterialIcon name={icon} className="text-outline" />
      </header>

      <div className="flex items-baseline gap-2">{children}</div>

      {footer ? <div className="mt-4">{footer}</div> : null}
    </article>
  );
};

/**
 * Bottom-of-card capacity bar used by node-readiness, CPU, and memory cards.
 *
 * Rendered with `aria-hidden` because the same numeric value is always
 * present in the headline. We do not duplicate it as a separate ARIA
 * progressbar.
 */
export interface KpiGaugeProps {
  /** 0..100. The component clamps the value so callers don't have to. */
  readonly percent: number;
  /** Tailwind color utility for the fill (e.g. "bg-emerald-500"). */
  readonly fillClassName: string;
}

export const KpiGauge: FC<KpiGaugeProps> = ({ percent, fillClassName }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      aria-hidden="true"
      className="h-1 w-full overflow-hidden rounded-full bg-surface-container"
    >
      <div
        className={`h-full ${fillClassName}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
