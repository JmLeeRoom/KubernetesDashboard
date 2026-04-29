/**
 * Domain types for the KubeControl Overview / Cluster screens.
 *
 * Source-of-truth alignment:
 * - Pod STATUS uses the kubectl-compatible computed string, not the raw
 *   `pod.status.phase` (see docs/kubernetes-dashboard-overview-cluster-research.md
 *   §3.2). That distinction is preserved in the field name `displayStatus`.
 * - Deployment health is derived from Deployment conditions (Available,
 *   Progressing, ReplicaFailure), not from a naive replica count comparison
 *   (research doc §3.3 / §7.3).
 * - List-style payloads always carry `metadata.resourceVersion` so the
 *   informer-cache backed BFF can drive list-then-watch reconciliation
 *   on the server side (research doc §3.4).
 *
 * No runtime values are exported from this module: it is types-only by design
 * for the Phase 1 shell.
 */

// ---------------------------------------------------------------------------
// Cluster identity
// ---------------------------------------------------------------------------

export type ClusterId = string;

export interface ClusterIdentity {
  readonly id: ClusterId;
  readonly displayName: string;
  readonly kubernetesVersion?: string;
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/**
 * Cluster-wide health classification. `unknown` is a deliberate first-class
 * value: research doc §6.3 explicitly forbids defaulting to `healthy` when
 * data is missing. UI MUST render `unknown` as a non-green state.
 */
export type ClusterHealth =
  | "healthy"
  | "degraded"
  | "critical"
  | "unknown";

export interface ClusterHealthSummary {
  readonly state: ClusterHealth;
  /**
   * Single short sentence intended for a banner. Required so that the UI
   * never has to invent its own copy from raw counters (Endsley
   * "Comprehension" stage; research doc §5.2).
   */
  readonly userMessage: string;
  /**
   * Number of distinct issues currently raising the alert level. Used as a
   * compact secondary signal next to the state label.
   */
  readonly issueCount: number;
}

// ---------------------------------------------------------------------------
// KPI cards (Total Nodes / Total Pods / CPU / Memory)
// ---------------------------------------------------------------------------

/**
 * Severity label attached to a numeric KPI, so the card UI can color the
 * gauge consistently with the `ClusterHealth` palette without a second
 * semantic mapping.
 */
export type KpiSeverity = "ok" | "warning" | "critical" | "neutral";

export interface NodeReadinessKpi {
  readonly readyCount: number;
  readonly totalCount: number;
  readonly severity: KpiSeverity;
}

export interface PodCountKpi {
  readonly active: number;
  /**
   * Hour-over-hour delta in active Pods, expressed as a signed percentage
   * (e.g. +12 means "+12% vs last hour"). `null` means data was insufficient
   * to compute a delta and the UI must hide the trend chip rather than
   * display 0%.
   */
  readonly deltaPercentVsLastHour: number | null;
}

export interface ResourceUsageKpi {
  /** Percentage 0..100 of capacity currently in use. */
  readonly usedPercent: number;
  /** Absolute usage value in the unit defined by `unit`. */
  readonly usedAbsolute: number;
  /** Absolute capacity value in the same unit. */
  readonly totalAbsolute: number;
  /** Unit label as displayed (e.g. "Cores", "GiB"). */
  readonly unit: string;
  readonly severity: KpiSeverity;
}

// ---------------------------------------------------------------------------
// Resource utilization timeseries
// ---------------------------------------------------------------------------

/**
 * The Overview chart switches between three metrics. Defined as a string
 * union so the toggle component is statically exhaustive.
 */
export type ResourceMetric = "cpu" | "memory" | "network";

export interface TimeseriesPoint {
  /** Unix epoch milliseconds. */
  readonly timestampMs: number;
  /** Y value. Unit interpretation is metric-dependent. */
  readonly value: number;
}

export interface ResourceTimeseries {
  readonly metric: ResourceMetric;
  /** Sampling interval in seconds for the returned series. */
  readonly stepSeconds: number;
  readonly points: ReadonlyArray<TimeseriesPoint>;
  /**
   * If Prometheus (or the configured monitoring source) is unreachable, the
   * BFF returns a partial-failure shape rather than a hard 500. The
   * frontend uses this to render a per-card stale/error state instead of
   * blanking the whole Overview page (research doc §3.5, §6.4).
   */
  readonly partial?: boolean;
}

// ---------------------------------------------------------------------------
// Recent events
// ---------------------------------------------------------------------------

/**
 * Severity for a Recent Event item. Driven by Kubernetes Event `type` and
 * `reason`, plus the involved object's current status. Research doc §3.6
 * notes that Events are best-effort supplemental data, so the UI never uses
 * `severity` as the sole signal for cluster health.
 */
export type EventSeverity = "info" | "success" | "warning" | "error";

export interface ClusterEventItem {
  readonly id: string;
  readonly severity: EventSeverity;
  readonly title: string;
  readonly message: string;
  readonly involvedObject?: {
    readonly kind: string;
    readonly namespace?: string;
    readonly name: string;
  };
  /** Unix epoch milliseconds the event was last observed. */
  readonly lastObservedAtMs: number;
}

// ---------------------------------------------------------------------------
// Overview page payload
// ---------------------------------------------------------------------------

/**
 * Single Overview API payload. The page-level component receives one of these
 * (or `undefined` while loading) and never does its own data joining beyond
 * formatting.
 */
export interface ClusterOverview {
  readonly cluster: ClusterIdentity;
  readonly health: ClusterHealthSummary;
  readonly nodes: NodeReadinessKpi;
  readonly pods: PodCountKpi;
  readonly cpu: ResourceUsageKpi;
  readonly memory: ResourceUsageKpi;
  readonly recentEvents: ReadonlyArray<ClusterEventItem>;
  readonly metadata: {
    /** Unix epoch ms when the BFF computed this payload. */
    readonly computedAtMs: number;
    /** Server-side resourceVersion for the underlying watch. */
    readonly resourceVersion?: string;
    /**
     * If true, the data may be stale because the informer cache or
     * monitoring source is degraded. The UI MUST surface this (research
     * doc §11.2 stale banner).
     */
    readonly stale: boolean;
  };
}

// ---------------------------------------------------------------------------
// Cluster page (Deployments drill-down)
// ---------------------------------------------------------------------------

/**
 * Logical namespace identifier as it appears in `metadata.namespace`. The
 * empty string is intentionally not a valid value: cluster-scoped workloads
 * use a sentinel ("__cluster__") in the UI layer rather than overloading
 * `""`, because Kubernetes itself uses both `""` and `"default"` to mean
 * "default namespace" in different surfaces and we do not want that
 * ambiguity to leak into our types.
 */
export type NamespaceName = string;

export interface NamespaceOption {
  readonly name: NamespaceName;
  /** Optional human-readable label override. */
  readonly displayName?: string;
}

/**
 * Deployment health classification used by the Cluster card.
 *
 * Derivation order is fixed by research doc §7.3 and MUST be implemented in
 * the BFF before reaching the UI:
 *   1. ReplicaFailure=True            → "failed"
 *   2. Progressing.reason == ProgressDeadlineExceeded → "failed"
 *   3. Available=False && readyReplicas == 0 → "failed"
 *   4. Available=False && partial ready → "degraded"
 *   5. rollout in progress             → "progressing"
 *   6. Available=True                  → "healthy"
 *   7. fallback                        → "unknown"
 *
 * The UI does not collapse "failed" into "degraded": doing so would erase
 * the distinction between a partially-available service (still serving
 * some traffic) and a fully-down service.
 */
export type DeploymentHealth =
  | "healthy"
  | "progressing"
  | "degraded"
  | "failed"
  | "unknown";

export interface DeploymentReplicaState {
  readonly desired: number;
  readonly ready: number;
  readonly available: number;
  readonly updated: number;
}

/**
 * Card-level summary for a Deployment. The `iconKey` is a stable hint the
 * frontend can map to a Material Symbols ligature (e.g. "api", "security")
 * so we don't ship full UI strings from the BFF.
 */
export interface DeploymentSummary {
  readonly id: string;
  readonly name: string;
  readonly namespace: NamespaceName;
  readonly health: DeploymentHealth;
  readonly replicas: DeploymentReplicaState;
  /** Container image tag of the latest ReplicaSet (e.g. "v2.4.1"). */
  readonly imageTag?: string;
  /** Unix epoch ms when the Deployment object was created. */
  readonly createdAtMs: number;
  /** Optional category hint that maps to an icon glyph in the UI. */
  readonly iconKey?: string;
  /**
   * Human-readable reason for the current health classification. Only
   * present when `health !== "healthy"`. Required so the UI never has to
   * synthesize copy from raw conditions.
   */
  readonly reason?: string;
}

/**
 * Per-Pod row used inside the Deployment card's Associated Pods list.
 * `displayStatus` is the kubectl-compatible computed string (research doc
 * §3.2), NOT `pod.status.phase`.
 */
export interface PodRow {
  readonly id: string;
  readonly name: string;
  readonly namespace: NamespaceName;
  readonly displayStatus: string;
  /** True if all containers are Ready (i.e. ready/total ratio == 1). */
  readonly isReady: boolean;
  readonly readyContainers: number;
  readonly totalContainers: number;
  readonly restartCount: number;
  readonly createdAtMs: number;
  /** Severity used by the UI to color the row (driven by displayStatus). */
  readonly severity: PodSeverity;
}

/**
 * Pod-row severity tier.
 *
 * Decoupled from `EventSeverity` because Pod severity is computed from
 * STATUS + Ready condition, while Event severity comes from the Event
 * object itself; they share no conversion contract.
 */
export type PodSeverity = "ok" | "info" | "warning" | "error";

export interface DeploymentWithPods {
  readonly deployment: DeploymentSummary;
  readonly pods: ReadonlyArray<PodRow>;
}

/**
 * Page-level payload for the Cluster screen. The page receives one of these
 * (or undefined while loading) per namespace selection.
 */
export interface ClusterPagePayload {
  readonly cluster: ClusterIdentity;
  readonly namespace: NamespaceName;
  readonly availableNamespaces: ReadonlyArray<NamespaceOption>;
  readonly deployments: ReadonlyArray<DeploymentWithPods>;
  readonly metadata: {
    readonly computedAtMs: number;
    readonly resourceVersion?: string;
    readonly stale: boolean;
    /**
     * Server-side pagination cursor. When non-null, the next page can be
     * fetched with `?continue=<token>` (research doc §3.4 chunked list).
     */
    readonly continueToken?: string | null;
  };
}

// ---------------------------------------------------------------------------
// Async UI envelope
// ---------------------------------------------------------------------------

/**
 * Discriminated union for any asynchronously loaded value. We avoid the
 * "data + isLoading + error" triplet pattern because it allows illegal
 * states (e.g. data and error simultaneously); a tagged union forces
 * components to handle every state explicitly.
 */
export type AsyncResource<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "success"; readonly data: T }
  | { readonly status: "error"; readonly error: Error };
