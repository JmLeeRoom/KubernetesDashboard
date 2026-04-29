import type { FC, ReactNode } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { DeploymentHealthBadge } from "@/features/cluster/DeploymentHealthBadge";
import type { DeploymentHealth } from "@/types/cluster";

/**
 * Card layout for a single Deployment.
 *
 * Composition contract:
 * - Header always renders: icon tile, name, age, version, health badge,
 *   replicas counter.
 * - Body slot is open for either an "Associated Pods" list or an empty
 *   state. The card itself does not assume one specific body shape.
 *
 * Phase 1 shell exposes the layout API (props) and a single layout
 * variant. When data lands, page-level code renders one
 * `<DeploymentCard ...>` per `DeploymentSummary` and passes the typed
 * `<PodRowItem>` rows into the `body` slot.
 */
export interface DeploymentCardProps {
  readonly name: string;
  /** Material Symbols ligature for the leading icon tile. */
  readonly iconName: string;
  /** Human-readable age string, e.g. "14d", "30d". */
  readonly age: string;
  /** Image tag, e.g. "v2.4.1". */
  readonly version: string;
  readonly health: DeploymentHealth;
  /** Replicas summary, e.g. "3/3 Replicas" or "1/2 Replicas". */
  readonly replicasSummary: string;
  /** Color for the replicas summary text — surfaces partial-availability. */
  readonly replicasTone?: "neutral" | "error";
  /** Body slot: a pod list, empty state, or null. */
  readonly body: ReactNode;
}

export const DeploymentCard: FC<DeploymentCardProps> = ({
  name,
  iconName,
  age,
  version,
  health,
  replicasSummary,
  replicasTone = "neutral",
  body,
}) => {
  const replicasClass =
    replicasTone === "error" ? "text-error" : "text-on-surface";

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-surface-bright bg-surface-container">
      <header className="flex items-start justify-between gap-4 border-b border-surface-bright bg-surface-container-high/50 p-container-margin">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant bg-surface-bright shadow-inner">
            <MaterialIcon
              name={iconName}
              filled
              className="text-primary-fixed"
            />
          </div>
          <div className="min-w-0">
            <h3 className="mb-1 font-h2 text-h2 text-on-surface truncate">
              {name}
            </h3>
            <div className="flex items-center gap-3 font-mono-data text-mono-data text-on-surface-variant">
              <span className="flex items-center gap-1">
                <MaterialIcon name="history" sizePx={14} />
                {age}
              </span>
              <span aria-hidden="true" className="text-surface-bright">
                |
              </span>
              <span className="flex items-center gap-1">
                <MaterialIcon name="tag" sizePx={14} />
                {version}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <DeploymentHealthBadge health={health} />
          <span
            className={`font-mono-data text-mono-data ${replicasClass}`}
          >
            {replicasSummary}
          </span>
        </div>
      </header>

      <div className="flex-1 bg-surface-container p-component-gap-md">
        <h4 className="mb-3 px-2 font-label-caps text-label-caps uppercase text-outline-variant">
          Associated Pods
        </h4>
        {body}
      </div>
    </article>
  );
};
