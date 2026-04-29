import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";
import { NamespaceSelector } from "@/features/cluster/NamespaceSelector";

/**
 * Cluster page composition.
 *
 * The Cluster page answers (research doc §1.1 / §7.1):
 *   "If something is wrong, which workload — and which Pod inside it — is
 *    the source?"
 *
 * Information architecture (research doc §7.2):
 *   1. Page header                                — title + subtitle
 *   2. Namespace selector                         — scope filter
 *   3. Filter bar (name/status/sort)              — Phase 1 reserved slot
 *   4. Deployment cards (each with Associated Pods)
 *
 * Phase 1 shell omits mock data entirely. The page renders header chrome
 * and an empty-state container in place of the deployment grid. When data
 * lands, the empty state is replaced by:
 *
 *   <DeploymentsGrid>
 *     {deployments.map(d => (
 *       <DeploymentCard key={d.deployment.id} ...>
 *         {d.pods.map(p => <PodRowItem key={p.id} ... />)}
 *       </DeploymentCard>
 *     ))}
 *   </DeploymentsGrid>
 *
 * The grid layout (1 col on mobile, 2 cols at xl+) is deliberately
 * deferred to that point so we don't ship empty card placeholders that
 * would imply data exists.
 */
export const ClusterPage: FC = () => {
  return (
    <div className="space-y-container-margin">
      <ClusterPageHeader />

      <DeploymentsEmptyState />
    </div>
  );
};

const ClusterPageHeader: FC = () => (
  <header className="mb-container-margin flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <h2 className="font-h1 text-h1 text-on-surface">Deployments</h2>
      <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
        Manage and monitor workload configurations across your cluster.
      </p>
    </div>
    <NamespaceSelector />
  </header>
);

/**
 * Empty-state for the Deployments grid.
 *
 * Wording avoids implying any cluster state from absence of cards. Until a
 * namespace is selected and data is fetched, "no workloads" cannot be
 * distinguished from "data not loaded yet"; the copy reflects that.
 */
const DeploymentsEmptyState: FC = () => (
  <section
    aria-label="Deployments"
    className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface-bright bg-surface-container/40 p-section-padding text-center"
  >
    <MaterialIcon
      name="inventory_2"
      sizePx={32}
      className="text-on-surface-variant/60"
    />
    <p className="font-body-base text-body-base text-on-surface">
      No deployments to display
    </p>
    <p className="max-w-md font-body-sm text-body-sm text-on-surface-variant">
      Select a namespace from the toolbar to load Deployment cards. The shell
      does not include sample data; cards will appear once the BFF is
      connected.
    </p>
  </section>
);
