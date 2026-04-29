import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Namespace selector control for the Cluster page.
 *
 * Phase 1 shell: the selector renders the visual structure (filter icon +
 * NAMESPACE caps label + select trigger) but is purely presentational —
 * the `<select>` is uncontrolled and contains no real options.
 *
 * When the data layer lands, this becomes a controlled component bound
 * to `ClusterPagePayload.namespace` and `availableNamespaces`. We deliberately
 * keep the markup as a native `<select>` for the shell so it remains
 * keyboard- and screen-reader-accessible by default; the design language
 * upgrade to a custom listbox is a separate concern.
 */
export interface NamespaceSelectorProps {
  /**
   * Currently displayed namespace label. The shell defaults to "—" rather
   * than a fake namespace name so empty data isn't misread as a real
   * selection.
   */
  readonly currentNamespace?: string;
}

export const NamespaceSelector: FC<NamespaceSelectorProps> = ({
  currentNamespace,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 shadow-sm">
      <MaterialIcon
        name="filter_list"
        sizePx={18}
        className="text-outline-variant"
      />
      <div className="flex flex-col">
        <label
          htmlFor="namespace-select"
          className="font-label-caps text-label-caps uppercase tracking-widest text-outline"
        >
          Namespace
        </label>
        <select
          id="namespace-select"
          aria-label="Select namespace"
          // The shell renders a single placeholder option. Once the
          // selector is wired up, this list comes from
          // `ClusterPagePayload.availableNamespaces`.
          defaultValue=""
          className="w-[160px] cursor-pointer border-none bg-transparent p-0 font-mono-data text-mono-data text-on-surface focus:outline-none focus:ring-0"
        >
          <option value="" disabled>
            {currentNamespace ?? "—"}
          </option>
        </select>
      </div>
    </div>
  );
};
