import type { FC } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ClusterPage } from "@/features/cluster/ClusterPage";
import { OverviewPage } from "@/features/overview/OverviewPage";

/**
 * Top-level application router.
 *
 * URL design (research doc §1.2 / §7.5): all primary routes are mounted
 * under a `/clusters/:clusterId/...` prefix in the long-term plan. Phase 1
 * runs against a single implicit cluster, so the shell uses the simpler
 * `/overview` and `/cluster` paths. When multi-cluster lands, swap these
 * for `clusters/:clusterId/overview` and `clusters/:clusterId/cluster`
 * without changing any feature code.
 */
export const App: FC = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/cluster" element={<ClusterPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Routes>
    </AppLayout>
  );
};
