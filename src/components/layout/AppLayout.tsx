import type { FC, PropsWithChildren } from "react";

import { SideNavBar } from "@/components/layout/SideNavBar";
import { TopAppBar } from "@/components/layout/TopAppBar";

/**
 * Application chrome wrapper.
 *
 * Renders the persistent left navigation column and the top app bar around
 * the routed page content. The structure (240px sidebar + 64px header that
 * are both `fixed`-positioned, with the main content offset accordingly) is
 * derived directly from the design reference and is intentionally
 * conservative: each page mounts inside the same scroll container so there
 * is exactly one vertical scrollbar in the viewport.
 */
export const AppLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <SideNavBar />

      <main className="ml-[240px] flex min-h-screen flex-1 flex-col">
        <TopAppBar />
        <div className="mt-16 flex-1 overflow-y-auto p-section-padding">
          {children}
        </div>
      </main>
    </div>
  );
};
