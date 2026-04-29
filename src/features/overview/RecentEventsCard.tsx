import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Recent Events card.
 *
 * Phase 1 shell renders the card chrome and an empty-state body. Once data
 * is wired up, the body will render `<EventListItem>` rows produced from
 * `ClusterOverview.recentEvents`, with a thin 1px divider between each.
 *
 * The "VIEW ALL" link is a static anchor for now. It will become a Router
 * link once the events page exists.
 */
export const RecentEventsCard: FC = () => {
  return (
    <section
      aria-label="Recent events"
      className="flex h-[340px] flex-col rounded-lg border border-panel-border bg-panel-bg p-6"
    >
      <header className="mb-4 flex items-center justify-between">
        <h3 className="font-h2 text-[18px] text-on-surface">Recent Events</h3>
        <a
          href="#"
          className="font-label-caps text-label-caps text-primary transition-colors hover:text-primary-fixed"
        >
          VIEW ALL
        </a>
      </header>

      <EmptyEventsBody />
    </section>
  );
};

/**
 * Empty-state body for the Recent Events card.
 *
 * The empty state intentionally communicates "no signal yet", not "all
 * clear". Research doc §3.6 warns against treating Events as a primary
 * health signal, so the wording avoids implying anything about cluster
 * state from the absence of events.
 */
const EmptyEventsBody: FC = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
    <MaterialIcon
      name="inbox"
      sizePx={28}
      className="text-on-surface-variant/60"
    />
    <p className="font-body-sm text-body-sm text-on-surface-variant">
      No events yet
    </p>
    <p className="max-w-[220px] font-body-sm text-[11px] text-on-surface-variant/70">
      Recent cluster events will appear here once they are observed.
    </p>
  </div>
);
