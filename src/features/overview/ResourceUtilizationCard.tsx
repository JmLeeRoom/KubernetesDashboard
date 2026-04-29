import { useState, type FC } from "react";

import type { ResourceMetric } from "@/types/cluster";

/**
 * Resource Utilization card.
 *
 * Phase 1 shell:
 * - Renders the card chrome (title + metric toggle group).
 * - Renders a chart "frame" with grid lines and an empty plot area.
 * - DOES NOT render any data points or mock series.
 *
 * The metric toggle is wired locally because it is purely a UI state
 * (selecting which series to fetch when data lands). A parent-owned form
 * of this state can be lifted later if the metric needs to be reflected
 * in the URL.
 */
export const ResourceUtilizationCard: FC = () => {
  const [metric, setMetric] = useState<ResourceMetric>("cpu");

  return (
    <section
      aria-label="Resource utilization"
      className="flex flex-col rounded-lg border border-panel-border bg-panel-bg p-6 lg:col-span-2"
    >
      <header className="mb-6 flex items-center justify-between">
        <h3 className="font-h2 text-h2 text-on-surface">Resource Utilization</h3>
        <MetricToggle value={metric} onChange={setMetric} />
      </header>

      <ChartFrame />
    </section>
  );
};

interface MetricToggleProps {
  readonly value: ResourceMetric;
  readonly onChange: (next: ResourceMetric) => void;
}

const METRIC_OPTIONS: ReadonlyArray<{
  readonly value: ResourceMetric;
  readonly label: string;
}> = [
  { value: "cpu", label: "CPU" },
  { value: "memory", label: "MEM" },
  { value: "network", label: "NET" },
];

const MetricToggle: FC<MetricToggleProps> = ({ value, onChange }) => {
  return (
    <div
      role="tablist"
      aria-label="Resource metric"
      className="flex rounded border border-panel-border bg-surface-container p-0.5"
    >
      {METRIC_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={[
              "rounded px-3 py-1 font-label-caps text-label-caps transition-colors",
              selected
                ? "bg-panel-border text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Empty chart canvas.
 *
 * We render the grid lines and time-axis labels because they belong to the
 * chart frame, not to the data. The plot area itself is left blank by
 * design (per task scope: "shell only, no mockup data"). When data is
 * wired up this is where the actual SVG/canvas chart will be drawn.
 */
const ChartFrame: FC = () => {
  return (
    <div className="relative flex min-h-[240px] flex-1 items-end">
      {/* Horizontal grid lines */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-6">
        <div className="w-full flex-1 border-b border-surface-container-high" />
        <div className="w-full flex-1 border-b border-surface-container-high" />
        <div className="w-full flex-1 border-b border-surface-container-high" />
        <div className="w-full flex-1 border-b border-surface-container-high" />
      </div>

      {/* Plot area placeholder. Empty by design. */}
      <div
        role="img"
        aria-label="No utilization data available yet"
        className="relative z-10 flex h-[calc(100%-24px)] w-full items-center justify-center"
      >
        <span className="font-mono-data text-mono-data text-on-surface-variant/50">
          —
        </span>
      </div>

      {/* Time-axis labels. Static, since they only describe the frame. */}
      <div className="absolute bottom-0 flex w-full justify-between font-mono-data text-[10px] text-on-surface-variant">
        <span>10:00</span>
        <span>10:15</span>
        <span>10:30</span>
        <span>10:45</span>
        <span>11:00</span>
      </div>
    </div>
  );
};
