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
