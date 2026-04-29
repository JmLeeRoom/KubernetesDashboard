import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";
import {
  KpiCard,
  KpiGauge,
} from "@/features/overview/KpiCard";

/**
 * Four-up KPI grid.
 *
 * Each card renders an empty value placeholder ("—") because Phase 1 is the
 * shell only; mock data is intentionally not introduced (per task scope).
 * Once wired up, replace each `<KpiValuePlaceholder/>` with a typed value
 * read from `ClusterOverview` and render the appropriate footer
 * (`KpiGauge` for capacity-bound metrics, `KpiTrendChip` for trend
 * metrics like Pod count delta).
 *
 * The grid follows the design reference: 1 col on mobile, 2 cols at md,
 * 4 cols at lg+, with a consistent 16px gutter.
 */
export const KpiCardGrid: FC = () => {
  return (
    <section
      aria-label="Cluster key metrics"
      className="grid grid-cols-1 gap-component-gap-md md:grid-cols-2 lg:grid-cols-4"
    >
      <KpiCard
        label="TOTAL NODES"
        icon="dns"
        footer={
          // Empty gauge track — width=0% — until node readiness is wired up.
          <KpiGauge percent={0} fillClassName="bg-status-healthy" />
        }
      >
        <KpiValuePlaceholder />
        <KpiSuffixPlaceholder />
      </KpiCard>

      <KpiCard label="TOTAL PODS" icon="apps" footer={<KpiTrendChipPlaceholder />}>
        <KpiValuePlaceholder />
        <KpiSuffixPlaceholder />
      </KpiCard>

      <KpiCard
        label="CPU USAGE"
        icon="memory"
        footer={<KpiGauge percent={0} fillClassName="bg-primary" />}
      >
        <KpiValuePlaceholder />
        <KpiSuffixPlaceholder />
      </KpiCard>

      <KpiCard
        label="MEMORY USAGE"
        icon="sd_card"
        footer={<KpiGauge percent={0} fillClassName="bg-amber-500" />}
      >
        <KpiValuePlaceholder />
        <KpiSuffixPlaceholder />
      </KpiCard>
    </section>
  );
};

/**
 * Renders an em-dash placeholder for the headline value. We use an em-dash
 * rather than "0" because "0" is itself a valid measurement and would
 * misrepresent the loading/empty state as a real reading.
 */
const KpiValuePlaceholder: FC = () => (
  <span className="font-h1 text-h1 text-on-surface" aria-label="No data yet">
    —
  </span>
);

const KpiSuffixPlaceholder: FC = () => (
  <span className="font-body-sm text-body-sm text-on-surface-variant">
    {"\u00A0"}
  </span>
);

/**
 * Placeholder for the Pod card's "+12% vs last hour" trend chip. Renders
 * the chip slot at full height so the card alignment matches the gauge
 * variants above it.
 */
const KpiTrendChipPlaceholder: FC = () => (
  <div className="flex items-center gap-2">
    <MaterialIcon
      name="trending_flat"
      sizePx={16}
      className="text-on-surface-variant"
    />
    <span className="font-mono-data text-mono-data text-on-surface-variant">
      —
    </span>
    <span className="font-body-sm text-[10px] text-on-surface-variant">
      vs last hour
    </span>
  </div>
);
