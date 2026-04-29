import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Cluster page placeholder.
 *
 * The Cluster page is part of Phase 1 (research doc §1.1) but the user's
 * current task scopes the implementation to the Overview shell. We provide
 * a clearly labeled placeholder so that the side-nav route is reachable
 * without a 404 and without misleading the user about what is implemented.
 */
export const ClusterPage: FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <MaterialIcon
        name="hub"
        sizePx={40}
        className="text-on-surface-variant/60"
      />
      <h2 className="font-h2 text-h2 text-on-surface">Cluster</h2>
      <p className="max-w-md font-body-base text-body-base text-on-surface-variant">
        Deployment-centric drill-down view. Not yet implemented in this
        shell — see the design document for the planned information
        architecture.
      </p>
    </div>
  );
};
