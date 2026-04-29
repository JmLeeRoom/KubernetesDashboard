import type { FC } from "react";
import { NavLink } from "react-router-dom";

import { MaterialIcon } from "@/components/icons/MaterialIcon";

/**
 * Fixed left-hand navigation column.
 *
 * Phase 1 surfaces only two primary destinations (Overview, Cluster) per the
 * research doc §5.3 cognitive-load section: navigation entries are the most
 * expensive cost a non-expert user pays, so we keep the surface area small
 * by design and reserve other resources for Phase 2+.
 *
 * The footer block (Docs, Logout) is rendered as static <a> anchors here
 * because they are out-of-app links, not React Router routes.
 */
export const SideNavBar: FC = () => {
  return (
    <nav
      aria-label="Primary"
      className="fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-panel-border bg-panel-bg"
    >
      <BrandHeader />

      <div className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          <li>
            <PrimaryNavItem to="/overview" icon="dashboard" label="Overview" />
          </li>
          <li>
            <PrimaryNavItem to="/cluster" icon="hub" label="Cluster" />
          </li>
        </ul>
      </div>

      <div className="space-y-1 border-t border-panel-border p-4">
        <FooterAnchor href="#" icon="description" label="Docs" />
        <FooterAnchor href="#" icon="logout" label="Logout" />
      </div>
    </nav>
  );
};

const BrandHeader: FC = () => (
  <div className="flex h-16 items-center border-b border-panel-border px-6">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
        <MaterialIcon
          name="hexagon"
          filled
          sizePx={20}
          className="text-on-primary"
        />
      </div>
      <div className="leading-tight">
        <h1 className="font-h1 text-lg font-bold tracking-tight text-on-surface antialiased">
          KubeControl
        </h1>
        <span className="font-mono-data text-[10px] text-outline">
          v1.28-stable
        </span>
      </div>
    </div>
  </div>
);

interface PrimaryNavItemProps {
  readonly to: string;
  readonly icon: string;
  readonly label: string;
}

/**
 * `NavLink` renders an `aria-current="page"` automatically, which is what
 * we use for both styling (active background + right border) and
 * accessibility (announced as the current page by AT).
 */
const PrimaryNavItem: FC<PrimaryNavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 rounded px-3 py-2",
          "transition-all duration-200 ease-in-out active:scale-[0.98]",
          isActive
            ? "border-r-2 border-primary bg-primary/10 font-semibold text-primary"
            : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface",
        ].join(" ")
      }
    >
      <MaterialIcon name={icon} sizePx={20} />
      <span className="font-body-sm font-medium">{label}</span>
    </NavLink>
  );
};

interface FooterAnchorProps {
  readonly href: string;
  readonly icon: string;
  readonly label: string;
}

const FooterAnchor: FC<FooterAnchorProps> = ({ href, icon, label }) => (
  <a
    href={href}
    className="flex items-center gap-3 rounded px-3 py-2 text-on-surface-variant transition-all duration-200 ease-in-out hover:bg-surface-container/50 hover:text-on-surface active:scale-[0.98]"
  >
    <MaterialIcon name={icon} sizePx={20} />
    <span className="font-body-sm font-medium">{label}</span>
  </a>
);
