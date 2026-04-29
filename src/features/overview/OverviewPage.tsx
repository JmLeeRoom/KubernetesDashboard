import type { FC } from "react";

import { KpiCardGrid } from "@/features/overview/KpiCardGrid";
import { OverviewHeader } from "@/features/overview/OverviewHeader";
import { RecentEventsCard } from "@/features/overview/RecentEventsCard";
import { ResourceUtilizationCard } from "@/features/overview/ResourceUtilizationCard";

/**
 * Overview page composition.
 *
 * The Overview answers a single question (research doc §6.1):
 *   "Is the cluster healthy right now, and if not, where do I look first?"
 *
 * It is composed of four sections that each map onto a typed slice of
 * `ClusterOverview` (see `src/types/cluster.ts`):
 *
 *   1. `OverviewHeader`         → cluster identity + `ClusterHealthSummary`
 *   2. `KpiCardGrid`            → nodes / pods / cpu / memory KPIs
 *   3. `ResourceUtilizationCard`→ `ResourceTimeseries` (CPU/MEM/NET toggle)
 *   4. `RecentEventsCard`       → recent `ClusterEventItem[]`
 *
 * The page itself owns no data in the Phase 1 shell. When data is wired up
 * the page will fetch a single `ClusterOverview` payload and pass typed
 * slices into each child rather than letting them all fetch independently.
 */
export const OverviewPage: FC = () => {
  return (
    <div className="space-y-container-margin">
      <OverviewHeader
        title="Cluster Overview"
        // Subtitle text is static here only because cluster identity is not
        // wired yet. Once `ClusterIdentity` is available, this will read:
        //   `High-level metrics and health status for ${cluster.displayName}`
        subtitle="High-level metrics and health status"
      />

      <KpiCardGrid />

      <div className="grid grid-cols-1 gap-component-gap-md lg:grid-cols-3">
        <ResourceUtilizationCard />
        <RecentEventsCard />
      </div>
    </div>
  );
};
