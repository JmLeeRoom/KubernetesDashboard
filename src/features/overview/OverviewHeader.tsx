import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Title + subtitle row for the Overview page, plus the right-aligned health
 * pill and the "Generate Report" secondary action.
 *
 * The shell renders a static `HEALTHY` pill so the visual hierarchy matches
 * the reference. Once health data is wired up, the pill becomes a
 * data-driven `<HealthBadge state={...}/>` component that maps
 * `ClusterHealth` to the proper color/icon/label triplet from
 * `src/types/cluster.ts`.
 */
export interface OverviewHeaderProps {
  readonly title: string;
  readonly subtitle: string;
}

export const OverviewHeader: FC<OverviewHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <header className="flex items-end justify-between">
      <div>
        <h2 className="font-h1 text-h1 text-on-surface">{title}</h2>
        <p className="mt-1 font-body-base text-body-base text-on-surface-variant">
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <HealthPillPlaceholder />
        <GenerateReportButton />
      </div>
    </header>
  );
};

/**
 * Static placeholder for the cluster-wide health summary pill.
 *
 * IMPORTANT: this is not a real status indicator. The shell renders the
 * "healthy" visual deliberately because that is what the design reference
 * shows; once the Overview API is wired up, this will be replaced with a
 * data-driven component that maps `ClusterHealthSummary.state` to one of
 * four visual variants (healthy | degraded | critical | unknown) per
 * research doc §6.3.
 */
const HealthPillPlaceholder: FC = () => (
  <span className="flex items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-label-caps text-label-caps text-emerald-400">
    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
    HEALTHY
  </span>
);

const GenerateReportButton: FC = () => (
  <button
    type="button"
    className="rounded border border-outline-variant px-3 py-1.5 font-label-caps text-label-caps text-on-surface transition-colors hover:bg-surface-container"
  >
    <span className="inline-flex items-center gap-1.5">
      <MaterialIcon name="description" sizePx={14} />
      GENERATE REPORT
    </span>
  </button>
);
