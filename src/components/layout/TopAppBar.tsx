import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Top app bar.
 *
 * This is the page-agnostic chrome that always sits above the routed content.
 * It contains: the application wordmark, a global resource search field, two
 * utility icon buttons (notifications, help), and a namespace selector
 * trigger.
 *
 * Phase 1 keeps every interactive control here as a non-functional shell:
 * - The search field is a controlled input but performs no query.
 * - The notifications and help buttons have no menu yet.
 * - The namespace selector is rendered statically; the actual selector menu
 *   will live in `NamespaceSelector` once data is wired up.
 *
 * The bar is `fixed` to the top edge so the dashboard scrolls behind it,
 * matching the reference HTML.
 */
export const TopAppBar: FC = () => {
  return (
    <header
      role="banner"
      className="fixed left-[240px] right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-panel-border bg-canvas-bg/80 px-8 backdrop-blur-sm"
    >
      <div className="flex h-full items-center gap-8">
        <span className="hidden font-h1 text-xl font-black text-on-surface md:block">
          KubeControl
        </span>
      </div>

      <div className="flex items-center gap-4">
        <SearchField />
        <div className="mx-2 h-6 w-px bg-panel-border" aria-hidden="true" />
        <IconButton icon="notifications" label="Notifications" />
        <IconButton icon="help_outline" label="Help" />
        <NamespaceTrigger namespaceLabel="Default Namespace" />
      </div>
    </header>
  );
};

/**
 * Read-only search affordance. The search behavior is intentionally not
 * implemented in the shell: connecting it requires both the Cluster
 * resource list endpoint and a debounced client-side index, neither of
 * which are in Phase 1 scope.
 */
const SearchField: FC = () => (
  <div className="relative hidden lg:block">
    <MaterialIcon
      name="search"
      sizePx={18}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
    />
    <label htmlFor="global-resource-search" className="sr-only">
      Search resources
    </label>
    <input
      id="global-resource-search"
      type="text"
      placeholder="Search resources..."
      className="w-64 rounded border border-outline-variant bg-surface-container py-1.5 pl-9 pr-4 font-body-sm text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      // The shell deliberately leaves this uncontrolled to avoid implying
      // working state. When Phase 1 search lands this becomes a controlled
      // input bound to a `useResourceSearch` hook.
    />
  </div>
);

interface IconButtonProps {
  readonly icon: string;
  readonly label: string;
}

const IconButton: FC<IconButtonProps> = ({ icon, label }) => (
  <button
    type="button"
    aria-label={label}
    className="text-on-surface-variant transition-colors hover:text-on-surface"
  >
    <MaterialIcon name={icon} sizePx={20} />
  </button>
);

interface NamespaceTriggerProps {
  readonly namespaceLabel: string;
}

/**
 * Static placeholder for the namespace selector trigger. Once the selector is
 * implemented this becomes a `<button>` that opens the actual dropdown.
 */
const NamespaceTrigger: FC<NamespaceTriggerProps> = ({ namespaceLabel }) => (
  <button
    type="button"
    aria-haspopup="listbox"
    aria-label="Select namespace"
    className="ml-2 flex items-center gap-2 rounded border border-panel-border bg-surface-container px-3 py-1.5"
  >
    <span
      aria-hidden="true"
      className="h-2 w-2 rounded-full bg-emerald-500"
    />
    <span className="font-mono-data text-xs text-on-surface">
      {namespaceLabel}
    </span>
    <MaterialIcon name="expand_more" sizePx={16} className="text-outline" />
  </button>
);
