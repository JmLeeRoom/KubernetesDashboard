import type { FC } from "react";

import { MaterialIcon } from "@/components/icons/MaterialIcon";
import type { PodSeverity } from "@/types/cluster";

/**
 * Single row in the Associated Pods list.
 *
 * Visual variants are driven by `PodSeverity`, which is computed from the
 * kubectl-compatible `displayStatus` plus the Ready condition (research doc
 * §3.2 / §7.4). The component never branches on raw `phase` or on STATUS
 * string equality — that mapping happens in the BFF.
 *
 * Phase 1 shell uses this component as the layout primitive only; the page
 * does not yet render any rows because mock data is intentionally
 * omitted.
 */
export interface PodRowItemProps {
  readonly podName: string;
  readonly displayStatus: string;
  readonly age: string;
  readonly severity: PodSeverity;
}

interface SeverityStyle {
  readonly icon: string;
  readonly iconClass: string;
  readonly nameClass: string;
  readonly statusClass: string;
  readonly ageClass: string;
  readonly menuClass: string;
  readonly rowClass: string;
}

const SEVERITY_STYLES: Record<PodSeverity, SeverityStyle> = {
  ok: {
    icon: "radio_button_checked",
    iconClass: "text-primary-fixed",
    nameClass: "text-on-surface group-hover:text-primary-fixed",
    statusClass: "text-on-surface-variant",
    ageClass: "text-outline-variant",
    menuClass: "text-outline-variant hover:text-on-surface",
    rowClass:
      "bg-surface hover:bg-surface-bright border-transparent hover:border-outline-variant",
  },
  info: {
    icon: "radio_button_checked",
    iconClass: "text-primary",
    nameClass: "text-on-surface group-hover:text-primary",
    statusClass: "text-on-surface-variant",
    ageClass: "text-outline-variant",
    menuClass: "text-outline-variant hover:text-on-surface",
    rowClass:
      "bg-surface hover:bg-surface-bright border-transparent hover:border-outline-variant",
  },
  warning: {
    icon: "warning",
    iconClass: "text-amber-400",
    nameClass: "text-amber-300",
    statusClass: "text-amber-300",
    ageClass: "text-amber-300/70",
    menuClass: "text-amber-300/70 hover:text-amber-300",
    rowClass: "bg-amber-500/5 border-amber-500/20",
  },
  error: {
    icon: "error",
    iconClass: "text-error",
    nameClass: "text-error",
    statusClass: "text-error",
    ageClass: "text-error/70",
    menuClass: "text-error/70 hover:text-error",
    rowClass: "bg-error-container/5 border-error-container/20",
  },
};

export const PodRowItem: FC<PodRowItemProps> = ({
  podName,
  displayStatus,
  age,
  severity,
}) => {
  const style = SEVERITY_STYLES[severity];

  return (
    <div
      className={`group flex items-center justify-between rounded-lg border p-3 transition-colors ${style.rowClass}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <MaterialIcon
          name={style.icon}
          sizePx={18}
          className={style.iconClass}
        />
        <span
          className={`font-mono-data text-mono-data transition-colors ${style.nameClass} truncate`}
          title={podName}
        >
          {podName}
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span
          className={`font-body-sm text-body-sm whitespace-nowrap ${style.statusClass}`}
        >
          {displayStatus}
        </span>
        <span
          className={`font-mono-data text-mono-data w-16 text-right ${style.ageClass}`}
        >
          {age}
        </span>
        <button
          type="button"
          aria-label={`Pod ${podName} actions`}
          className={`transition-colors ${style.menuClass}`}
        >
          <MaterialIcon name="more_vert" sizePx={18} />
        </button>
      </div>
    </div>
  );
};
