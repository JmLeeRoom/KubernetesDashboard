# KubernetesDashboard Overview / Cluster 코어 설계 근거 문서

> 목적: `KubernetesDashboard`의 첫 코어를 `Overview`와 `Cluster` 중심으로 정의하고, 이후 기능을 확장할 때 흔들리지 않아야 할 설계 원칙을 공식 문서와 연구 문헌에 근거해 정리한다.
> 범위: 코드 구현이 아니라 구현 전 판단 기준, 데이터 경계, 화면 정보 구조, 확장 원칙, 검증 기준을 정의한다.
> 작성 원칙: 추측 금지, 출처 명시, 공식 문서와 연구 문헌의 주장 범위를 벗어난 과장 금지.

---

## 1. 결론 요약

### 1.1 본 프로젝트의 코어 정의

Phase 1의 코어는 다음 두 화면이다.

| 화면 | 핵심 질문 | 반드시 보여야 하는 정보 | 확장 방향 |
|---|---|---|---|
| `Overview` | "클러스터가 지금 정상인가?" | 클러스터 전체 health, Node readiness, Pod 상태 분포, Deployment 상태 분포, 리소스 포화도, 최근 Event | Alerts, SLO, 멀티 클러스터 summary |
| `Cluster` | "문제가 있다면 어느 workload / Pod인가?" | Namespace 필터, Deployment 카드, replica 상태, Deployment condition, 연결된 Pod의 `kubectl` 동일 STATUS | Pods, Nodes, Services, Ingresses, Logs, Actions |

이 구조는 Kubernetes의 객체 모델과 SRE 모니터링 원칙 모두에 맞다. Kubernetes 공식 문서는 Pod가 일시적이고 컨트롤러가 replacement를 관리한다고 설명하며, Deployment는 Pod와 ReplicaSet의 desired state를 선언적으로 관리한다. 따라서 비전문가용 대시보드는 Pod 단독 목록보다 Deployment 중심으로 문제를 묶어 보여주는 것이 더 안정적이다.
근거: Kubernetes Pod lifecycle, Deployment 공식 문서.

### 1.2 반드시 지켜야 할 10개 원칙

| 번호 | 원칙 | 이유 | 근거 등급 |
|---:|---|---|---|
| 1 | `Overview`는 "전체 상태의 한 문장 판단"을 먼저 보여준다. | 사용자는 많은 지표보다 먼저 정상/주의/위험을 알아야 한다. | SRE + HCI 연구 |
| 2 | `Cluster`는 Deployment 중심으로 시작한다. | Deployment가 ReplicaSet/Pod rollout과 availability의 관리 단위다. | Kubernetes 공식 |
| 3 | Pod STATUS는 `pod.status.phase`가 아니라 `kubectl` 표시와 일치해야 한다. | 공식 문서가 phase와 kubectl STATUS를 구분한다. | Kubernetes 공식 |
| 4 | 현재 객체 상태는 kube-apiserver list/watch + informer cache에서 온다. | Kubernetes API는 list-then-watch와 `resourceVersion` 기반 동기화를 제공한다. | Kubernetes 공식 |
| 5 | 사용자가 늘어도 kube-apiserver 부하는 사용자 수에 선형 증가하지 않아야 한다. | 모든 브라우저가 직접 polling하면 control plane을 압박한다. | Kubernetes 공식 + 분산 시스템 논문 |
| 6 | 시계열 메트릭은 Metrics Server가 아니라 Prometheus 계열 monitoring source를 사용한다. | Metrics Server는 autoscaling pipeline용이며 monitoring source가 아니다. | Metrics Server 공식 |
| 7 | Event는 보조 신호로 취급하고 장기 보관이 필요하면 별도 저장한다. | Event 공식 문서는 제한된 retention과 best-effort 성격을 명시한다. | Kubernetes 공식 |
| 8 | RBAC는 `get/list/watch` 최소 권한만 부여하고 Secrets는 제외한다. | Secret의 `list/watch`도 내용 노출로 이어진다. | Kubernetes 공식 |
| 9 | URL은 처음부터 `/clusters/:clusterId/...` 구조를 사용한다. | 멀티 클러스터 확장 시 라우팅과 데이터 모델 파괴를 막는다. | Kubernetes API 구조 + Borg/Omega/Kubernetes 논문 |
| 10 | v1은 읽기 전용이어야 하며 쓰기 기능은 audit, dry-run, authorization 모델이 준비된 뒤 추가한다. | 쓰기 기능은 안전성, 권한, 감사, 동시성 제어가 필요하다. | Kubernetes 공식 + 보안 원칙 |

---

## 2. 근거 등급과 해석 규칙

### 2.1 근거 등급

| 등급 | 의미 | 본 문서에서의 사용 |
|---|---|---|
| A | Kubernetes / Metrics Server / MDN / Google SRE 등 1차 공식 문서 | 구현 제약, API 동작, 보안 요구의 기준 |
| B | 동료 심사를 거친 논문, ACM/EuroSys/NSDI 등 연구 문헌 | 아키텍처 방향과 확장성 원칙의 근거 |
| C | 널리 쓰이는 실무 문헌, 디자인 가이드, 벤더 문서 | UI 패턴, threshold 기본값, 운영 편의성의 참고 |
| D | 프로젝트 내부 설계 가정 | 반드시 "가정"으로 표시하며 실제 구현 전 검증 필요 |

### 2.2 중요한 해석 제한

1. Kubernetes 공식 문서는 "대시보드를 이렇게 디자인하라"고 직접 말하지 않는다. 대신 Pod, Deployment, API watch, Event, RBAC의 사실과 제약을 제공한다.
2. Borg/Omega/Kubernetes 논문은 Kubernetes Dashboard UX 논문이 아니다. 이 논문은 cluster management system의 shared state, reconciliation, API server 중심 모델을 이해하기 위한 아키텍처 근거다.
3. SRE Golden Signals는 Kubernetes cluster 자체에 그대로 1:1 대응되지 않는다. 본 문서는 latency/traffic 대신 Kubernetes 운영 관점의 availability, errors, saturation, change signal로 재해석한다.
4. HCI 연구는 "비전문가가 5초 안에 Kubernetes를 이해한다"는 수치를 보장하지 않는다. 다만 상황 인식, 인지 부하, dashboard summary 원칙을 근거로 정보 구조를 설계할 수 있다.

---

## 3. 공식 문서 기반 Kubernetes 사실

### 3.1 Pod는 durable unit이 아니다

Kubernetes 공식 문서는 Pod를 "relatively ephemeral"한 객체로 설명한다. Node가 죽으면 해당 Node의 Pod는 unhealthy로 취급되고 결국 삭제되며, 같은 이름의 replacement Pod가 생겨도 UID는 달라진다. 즉, Pod는 운영자가 장기적으로 추적할 안정적인 애플리케이션 단위가 아니다.

설계 결론:

- `Overview`에서 Pod 수와 상태 분포는 보여주되, 사용자의 첫 분석 단위로 만들지 않는다.
- `Cluster`는 Deployment -> ReplicaSet -> Pod의 소유 관계를 따라 문제를 묶는다.
- Pod 상세 확장은 Phase 2 이후로 가능하지만, Phase 1의 코어는 Deployment 카드 내부의 Associated Pods로 충분하다.

근거:

- Kubernetes Pod Lifecycle: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/

### 3.2 Pod `phase`와 `kubectl STATUS`는 다르다

Kubernetes 공식 문서는 Pod `status.phase`가 단순한 high-level summary이며 comprehensive state machine이 아니라고 명시한다. 또한 `CrashLoopBackOff`나 `Terminating`은 Pod phase가 아니라 일부 `kubectl` 명령의 `Status` 필드에 나타나는 사용자 직관용 표시라고 설명한다.

설계 결론:

- API 응답의 `computed.displayStatus`는 `phase`를 그대로 복사하면 안 된다.
- `Cluster` 화면의 Pod 행은 사용자가 `kubectl get pods`에서 보는 STATUS와 같아야 한다.
- `Running`이더라도 `Ready=False`이면 건강한 상태로 단순 처리하면 안 된다.
- `CrashLoopBackOff`, `ImagePullBackOff`, `OOMKilled`, `Init:0/2`, `Terminating`은 별도 severity와 사용자 설명이 필요하다.

근거:

- Kubernetes Pod Lifecycle: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
- kubectl printer 구현 참고: https://github.com/kubernetes/kubernetes/blob/master/pkg/printers/internalversion/printers.go

### 3.3 Deployment는 Phase 1 Cluster 화면의 자연스러운 중심이다

Kubernetes 공식 문서는 Deployment가 Pod와 ReplicaSet에 대한 declarative update를 제공하고, desired state로 actual state를 controlled rate로 변경한다고 설명한다. Deployment는 rollout, rollback, scale, stuck rollout의 상태를 표현한다.

설계 결론:

- `Cluster` 화면의 기본 단위는 Deployment 카드다.
- Deployment health는 replica 숫자 단순 비교가 아니라 `Available`, `Progressing`, `ReplicaFailure` condition을 해석해야 한다.
- RollingUpdate에서 `maxSurge` 때문에 일시적으로 Pod 수가 desired보다 많아지는 것은 정상이다. 이를 장애로 표시하면 안 된다.
- Phase 2 쓰기 기능은 Deployment 단위 action부터 시작하는 것이 자연스럽다. 예: restart rollout, scale, rollback.

근거:

- Kubernetes Deployment: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

### 3.4 Kubernetes API는 list-then-watch 동기화를 전제로 한다

Kubernetes API 공식 문서는 효율적인 change detection을 위해 list/get 후 watch를 수행하고, 모든 객체의 `resourceVersion`을 사용해 변경을 추적한다고 설명한다. watch가 오래된 resourceVersion으로 실패하면 `410 Gone`을 처리하고 새 list부터 다시 시작해야 한다.

설계 결론:

- BFF는 객체 현재 상태를 매 요청마다 kube-apiserver에 polling하지 않는다.
- BFF 내부에 informer cache를 두고, 사용자 요청은 cache에서 응답한다.
- 모든 list 응답 metadata에는 `resourceVersion`, `continue`를 포함한다.
- 대규모 클러스터 대비를 위해 `limit` / `continue` 기반 chunking을 설계에 포함한다.
- watch reconnect와 cache resync는 백엔드 책임이며 프론트엔드는 stale 상태만 명확히 표시한다.

근거:

- Kubernetes API Concepts: https://kubernetes.io/docs/reference/using-api/api-concepts/

### 3.5 Metrics Server는 dashboard monitoring source가 아니다

Metrics Server 공식 문서는 Metrics Server가 Kubernetes built-in autoscaling pipeline용 CPU/Memory resource metrics source이며, non-autoscaling 목적이나 monitoring solution metrics source로 쓰지 말라고 명시한다.

설계 결론:

- `Overview`의 Resource Utilization 차트는 Metrics Server를 주 데이터 소스로 삼지 않는다.
- Phase 1의 권장 소스는 Prometheus + kube-state-metrics + node-exporter다.
- Metrics Server가 설치되어 있어도 "간단한 top" 수준의 보조 정보로만 취급한다.
- Prometheus 미연동 상태는 전체 장애가 아니라 "차트 부분 장애"로 표시한다.

근거:

- Metrics Server 공식 문서: https://kubernetes-sigs.github.io/metrics-server/

### 3.6 Kubernetes Event는 best-effort supplemental data다

Kubernetes Event API 공식 문서는 Event가 cluster 내부 state change report이며, limited retention time을 갖고 trigger/message가 시간에 따라 바뀔 수 있으며, Event consumer가 특정 Reason의 지속적 존재나 timing에 의존해서는 안 된다고 명시한다.

설계 결론:

- Recent Events는 원인 추론의 보조 자료이지 health 판정의 단일 근거가 아니다.
- 장애 원인 안내는 Event만이 아니라 Pod/Deployment 상태와 함께 보여준다.
- 1시간 이후 사고 회고가 필요하면 Event를 PostgreSQL 등 별도 저장소에 영속화해야 한다.
- Event message는 사람이 읽는 설명으로 표시하되, 자동화의 강한 조건으로 사용하지 않는다.

근거:

- Kubernetes Event API: https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/

### 3.7 RBAC는 최소 권한과 Secrets 제외가 기본이다

Kubernetes RBAC good practices는 least privilege를 권장하고, wildcard 권한을 피하라고 명시한다. 특히 Secrets는 `get`뿐 아니라 `list`와 `watch`도 Secret 내용을 노출한다고 설명한다.

설계 결론:

- Phase 1 기본 권한은 `pods`, `deployments`, `replicasets`, `nodes`, `namespaces`, `events`의 `get/list/watch`로 제한한다.
- `secrets`는 모든 verb에서 제외한다.
- `pods/log`, `pods/exec`, `nodes/proxy`, `configmaps`, `serviceaccounts`는 Phase 1 기본 권한에 포함하지 않는다.
- 사용자 신원 전달을 위해 impersonation을 쓸 경우, 그 권한은 별도 ClusterRole로 분리하고 감사 로그를 반드시 남긴다.

근거:

- RBAC 공식 문서: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
- RBAC Good Practices: https://kubernetes.io/docs/concepts/security/rbac-good-practices/
- User Impersonation: https://kubernetes.io/docs/reference/access-authn-authz/user-impersonation/

---

## 4. 논문 기반 아키텍처 근거

### 4.1 Borg, Omega, Kubernetes의 공통 교훈

Google의 "Borg, Omega, and Kubernetes"는 Borg, Omega, Kubernetes 세 시스템의 경험을 비교한다. Kubernetes는 open-source 환경을 위해 설계되었고, shared persistent store와 API server 중심 접근을 채택한다. 이 방향은 모든 client가 state를 임의로 해석하기보다, API server를 통해 validation, versioning, policy를 적용하는 구조로 이해할 수 있다.

설계 결론:

- Dashboard BFF는 kube-apiserver와 직접 연결되는 control-plane client다.
- 브라우저가 직접 kube-apiserver에 붙는 구조보다, BFF가 인증, 권한, cache, 요약 계산, 사용자 친화 메시지를 담당하는 구조가 적절하다.
- 모든 확장 기능은 `clusterId`, `resourceVersion`, `kind/apiVersion/metadata`를 보존해야 한다.
- Phase 2의 multi-cluster는 "cluster as record" 모델로 확장한다. URL과 DB에 cluster identity를 v1부터 넣는다.

근거:

- Burns, B., Grant, B., Oppenheimer, D. "Borg, Omega, and Kubernetes." ACM Queue, 2016. https://research.google/pubs/borg-omega-and-kubernetes/
- 논문 PDF: https://research.google.com/pubs/archive/44843.pdf

### 4.2 Borg 논문의 운영 교훈

"Large-scale cluster management at Google with Borg"는 대규모 cluster manager가 긴 수명의 서비스와 batch job을 함께 운영하고, 대규모 machine pool에서 scheduling, failure recovery, utilization을 관리해야 함을 다룬다. 이 논문은 Kubernetes Dashboard의 UI 논문은 아니지만, 클러스터 관리 도구가 개별 컨테이너보다 service/workload 단위와 capacity signal을 함께 다뤄야 한다는 배경을 제공한다.

설계 결론:

- `Overview`에는 resource saturation이 반드시 필요하다.
- `Cluster`에는 workload 단위 availability가 반드시 필요하다.
- 단일 Pod 문제와 전체 service 문제를 구분해야 한다.

근거:

- Verma et al. "Large-scale cluster management at Google with Borg." EuroSys 2015. https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/
- 논문 PDF: https://research.google.com/pubs/archive/43438.pdf

### 4.3 Omega 논문의 shared state 교훈

Omega 논문은 대규모 cluster scheduler에서 monolithic scheduler와 two-level scheduler의 한계를 논의하고, shared state와 optimistic concurrency를 활용하는 구조를 제안한다. Dashboard 설계에 직접 적용할 수 있는 핵심은 "상태는 중앙에서 일관되게 관찰하고, 변경은 버전과 충돌 가능성을 고려해야 한다"는 점이다.

설계 결론:

- Phase 1 읽기 전용이라도 `resourceVersion`을 API 응답에 포함한다.
- Phase 2 쓰기 기능은 optimistic concurrency, dry-run, audit log를 전제로 한다.
- UI에서 오래된 데이터를 보고 action을 누르는 문제를 막기 위해 stale 표시와 resourceVersion 확인이 필요하다.

근거:

- Schwarzkopf et al. "Omega: flexible, scalable schedulers for large compute clusters." EuroSys 2013. https://research.google/pubs/omega-flexible-scalable-schedulers-for-large-compute-clusters/
- 논문 PDF: https://research.google.com/pubs/archive/41684.pdf

---

## 5. SRE / HCI 기반 화면 정보 구조

### 5.1 Dashboard는 핵심 질문에 답해야 한다

Google SRE Book은 dashboard를 "service core metrics의 summary view"로 정의하고, dashboard가 서비스에 대한 basic questions에 답해야 하며 보통 Four Golden Signals를 포함한다고 설명한다.

Kubernetes cluster dashboard에 대한 재해석:

| SRE Golden Signal | 일반 서비스 의미 | Kubernetes Dashboard 재해석 |
|---|---|---|
| Latency | 요청 처리 시간 | Phase 1에서는 직접 core 아님. API/BFF latency는 운영 메트릭으로 수집 |
| Traffic | 요청량 | Phase 1 화면 core 아님. BFF traffic은 운영 메트릭 |
| Errors | 실패 요청률 | Pod failed/CrashLoop, Deployment unavailable, Warning Events |
| Saturation | 자원 포화도 | Node CPU/Mem, Pod capacity, unavailable replicas |

설계 결론:

- `Overview`는 health summary + errors + saturation을 한 화면에서 보여준다.
- `Cluster`는 `Overview`의 errors를 workload 단위로 drill-down한다.
- 사람을 깨우는 alert가 아니라 읽기 전용 dashboard이므로, 과도한 원인 추론보다 명확한 상태 표시가 중요하다.

근거:

- Google SRE Book, Monitoring Distributed Systems: https://sre.google/sre-book/monitoring-distributed-systems/

### 5.2 Situation awareness 관점

상황 인식 연구에서 널리 쓰이는 Endsley 모델은 상황 인식을 세 단계로 설명한다: 현재 요소의 지각, 현재 의미의 이해, 미래 상태의 예측. 이 모델은 항공, 의료, 산업 제어 같은 복잡한 시스템 dashboard 연구에서 반복적으로 사용된다.

Kubernetes Dashboard 적용:

| 단계 | 사용자 질문 | Overview / Cluster 설계 |
|---|---|---|
| Perception | 무엇이 보이는가? | Node/Pod/Deployment/Event/Resource 수치와 badge |
| Comprehension | 이것이 무슨 의미인가? | Healthy/Degraded/Critical 문장, tooltip, readableMessage |
| Projection | 곧 어떻게 될 것인가? | Resource trend, rollout progressing, repeated restart count |

설계 결론:

- 색상만 보여주는 상태 점은 부족하다. 텍스트와 이유가 함께 있어야 한다.
- `Overview`의 첫 문장은 "현재 의미"를 설명해야 한다.
- `Cluster`의 각 Deployment는 "왜 degraded인지"를 conditions와 Pod 상태로 연결해야 한다.

근거:

- Endsley, M. R. "Toward a Theory of Situation Awareness in Dynamic Systems." Human Factors, 1995.
- ICU dashboard 상황 인식 연구 예: "Situation Awareness-Oriented Dashboard in ICUs in Support of Resource Management in Time of Pandemics." 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC9904450/

주의: 위 ICU 연구는 Kubernetes 연구가 아니므로, "dashboard가 Kubernetes 운영 성과를 향상한다"는 직접 근거로 쓰면 안 된다. 복잡한 운영 환경에서 상황 인식형 dashboard가 어떤 정보 구조를 가져야 하는지의 보조 근거로만 사용한다.

### 5.3 Cognitive load 관점

인지 부하 이론은 학습자나 사용자의 작업 기억 용량이 제한적이며, 불필요한 정보와 복잡한 표현이 문제 해결을 방해할 수 있음을 설명한다. Kubernetes 비전문가는 Pod, Deployment, ReplicaSet, Namespace, Node 같은 개념 자체가 학습 부담이다.

설계 결론:

- Phase 1 navigation은 `Overview`, `Cluster` 두 항목만 둔다.
- `Cluster` 안에서도 Deployment를 먼저 보여주고 Pod는 하위 행으로 둔다.
- CRD, Helm, Argo CD, Service Mesh, Logs, Exec는 Phase 1 core가 아니다.
- 화면에 있는 모든 Kubernetes 용어는 짧은 정의 tooltip을 제공한다.

근거:

- Sweller, J. "Cognitive Load During Problem Solving: Effects on Learning." Cognitive Science, 1988.
- Kubernetes 공식 개념 문서: https://kubernetes.io/docs/concepts/

---

## 6. Overview 화면 상세 근거 설계

### 6.1 Overview의 목적

`Overview`의 목적은 모든 리소스를 나열하는 것이 아니라 다음 질문에 답하는 것이다.

1. 클러스터 전체가 정상인가?
2. 문제가 있다면 어떤 계층인가? Node, Deployment, Pod, Resource, Event?
3. 다음으로 어디를 클릭해야 하는가?

### 6.2 필수 섹션

| 우선순위 | 섹션 | 표시 데이터 | 주요 근거 |
|---|---|---|---|
| P0 | Hero Health Banner | `healthy/degraded/critical/unknown`, 요약 문장, issue count | SRE dashboard summary, situation awareness |
| P0 | KPI Cards | Nodes ready/total, Pods total/status, CPU, Memory | Kubernetes objects + saturation |
| P0 | Health Summary Strip | Running/Pending/Failed/Unknown Pod count, Deployment health count | Pod phase/STATUS 구분 |
| P0 | Resource Utilization | CPU/Mem/Network time series | Metrics Server 한계, Prometheus 권장 |
| P1 | Recent Events | Warning/Normal events, involved object, timestamp | Event는 supplemental data |
| P1 | Stale / Partial Failure Banner | informer stale, Prometheus down, API unreachable | 사용자가 오래된 데이터를 신뢰하는 위험 방지 |

### 6.3 Overview health 판정 원칙

Health 판정은 다음 데이터의 조합이어야 한다.

| 데이터 | 정본 소스 | health에 반영하는 방식 |
|---|---|---|
| Node Ready | Kubernetes API watch/cache | NotReady 비율이 critical/degraded 판정의 강한 신호 |
| Deployment Conditions | Kubernetes API watch/cache | Available=False, ProgressDeadlineExceeded, ReplicaFailure 반영 |
| Pod computed STATUS | Kubernetes API watch/cache + kubectl 호환 알고리즘 | CrashLoopBackOff, ImagePullBackOff, OOMKilled 등 반영 |
| Resource saturation | Prometheus | CPU/Mem threshold 및 trend 반영 |
| Events | Kubernetes watch + optional PG storage | 설명과 drill-down 보조 신호 |

금지:

- Event만 보고 cluster health를 critical로 판정하지 않는다.
- CPU 평균 하나만 보고 cluster health를 healthy로 판정하지 않는다.
- `pod.status.phase == Running`만 보고 Pod를 healthy로 판정하지 않는다.

### 6.4 Overview API 계약

권장 endpoint:

- `GET /api/v1/clusters/:clusterId/overview`
- `GET /api/v1/clusters/:clusterId/utilization?metric=cpu&from=now-1h&to=now&step=30s`
- `GET /api/v1/clusters/:clusterId/events?since=now-1h&limit=20`
- `GET /api/v1/clusters/:clusterId/stream?topics=overview,events`

응답 원칙:

- 모든 응답은 `clusterId`, `metadata.computedAt`, `metadata.resourceVersion` 또는 source-specific timestamp를 포함한다.
- Prometheus 장애는 `/overview` 전체 실패가 아니라 utilization endpoint의 `503` 또는 partial status로 표현한다.
- `health.userMessage`는 사람이 읽는 한 문장으로 제공한다.

---

## 7. Cluster 화면 상세 근거 설계

### 7.1 Cluster의 목적

`Cluster` 화면은 "클러스터 구성 전체를 보여주는 inventory"가 아니라 `Overview`에서 발견한 문제를 Deployment와 Pod 단위로 식별하는 drill-down 화면이다.

### 7.2 Phase 1 기본 구조

| 영역 | 기능 | 이유 |
|---|---|---|
| Namespace selector | namespace 단위 scope 제한 | 대부분의 workload는 namespaced resource다 |
| Filter bar | name/status/search/sort | Deployment 수가 늘어날 때 탐색 비용 감소 |
| Deployment card | health, replicas, image tag, age, condition reason | Deployment가 rollout/availability 단위다 |
| Associated Pods | Pod name, READY, STATUS, restarts, age | 실제 failure는 Pod/container state에서 드러난다 |
| Disabled action menu | Copy name, View YAML 등 읽기 전용 | Phase 2 action 위치를 미리 확보하되 오해 방지 |

### 7.3 Deployment health 판정

Deployment health는 다음 순서로 판정한다.

1. `ReplicaFailure=True`이면 `failed`
2. `Progressing.reason == ProgressDeadlineExceeded`이면 `failed`
3. `Available=False`이고 `readyReplicas == 0`이면 `failed`
4. `Available=False`이고 일부만 ready이면 `degraded`
5. rollout 진행 중이면 `progressing`
6. `Available=True`이면 `healthy`
7. 판단 근거가 부족하면 `unknown`

근거:

- Deployment conditions 공식 문서: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/

### 7.4 Pod row 표시 규칙

| 표시 | 기준 | 설명 |
|---|---|---|
| READY | ready containers / total containers | `kubectl get pods`와 같은 인지 모델 |
| STATUS | `kubectl` 호환 computed displayStatus | `phase`를 그대로 쓰지 않음 |
| RESTARTS | container restart count 합 | CrashLoopBackOff 판단의 강한 보조 신호 |
| AGE | metadata.creationTimestamp 기준 | replacement Pod는 UID와 age가 달라짐 |
| Severity | computed STATUS + Ready condition | 색/아이콘/텍스트 3중 표시 |

### 7.5 Cluster API 계약

권장 endpoint:

- `GET /api/v1/clusters/:clusterId/namespaces`
- `GET /api/v1/clusters/:clusterId/deployments?ns=:namespace&status=:status&limit=50&continue=:token`
- `GET /api/v1/clusters/:clusterId/deployments/:namespace/:name/pods`
- `GET /api/v1/clusters/:clusterId/stream?topics=deployments,pods&ns=:namespace`

확장 대비:

- Phase 2에서 `/pods`, `/nodes`, `/services`, `/ingresses`를 추가해도 `/clusters/:clusterId` prefix는 유지한다.
- Deployment 하위 Pod endpoint는 owner relation을 감추고 사용자에게 쉬운 구조를 제공한다. 내부 구현은 ReplicaSet selector와 ownerReference를 정확히 사용한다.

---

## 8. 데이터 소스 경계

### 8.1 세 가지 데이터 계층

| 데이터 | 정본 | 이유 |
|---|---|---|
| 현재 K8s 객체 상태 | kube-apiserver list/watch + informer cache | Kubernetes 객체의 authoritative state |
| 시계열 resource metrics | Prometheus / kube-state-metrics / node-exporter | Metrics Server는 monitoring source가 아님 |
| 영속 operational data | PostgreSQL | Events 장기 보관, audit log, 사용자 설정 |

### 8.2 PostgreSQL이 정본이 되면 안 되는 것

PostgreSQL은 다음의 정본이 아니다.

- 현재 Pod 목록
- 현재 Deployment status
- 현재 Node Ready 상태
- 현재 resourceVersion

이 데이터를 PostgreSQL에 복제해 정본처럼 사용하면 informer cache와 DB 사이에 이중 진실의 원천이 생긴다. PG는 Event retention, audit, preferences, cluster connection metadata에 한정한다.

### 8.3 Mock-first와 연구 문서의 관계

Mock-first는 연구 근거가 아니라 개발/검증 전략이다. 그러나 공식 문서에 근거한 schema와 상태 판정 규칙을 mock에 반영하면 다음 장점이 있다.

- 백엔드 완성 전에도 `Overview` / `Cluster` UX를 검증할 수 있다.
- Pod STATUS, Deployment health의 edge case를 fixture로 고정할 수 있다.
- real response와 mock response의 schema equivalence를 contract test로 검증할 수 있다.

---

## 9. 확장 로드맵

### 9.1 Phase 1: Core

범위:

- Overview
- Cluster - Deployments + Associated Pods
- Namespace selector
- Read-only
- OIDC 인증
- 최소 RBAC
- Informer cache
- Prometheus utilization
- Event recent view
- Mock-first contract

하지 않는 것:

- Pod exec
- log streaming
- restart/scale/rollback
- CRD generic browser
- Helm/Argo CD integration
- 자체 alert engine

### 9.2 Phase 2: Operational expansion

추가 가능 항목:

- Pods 전용 화면
- Nodes 상세
- Services / Ingresses
- Alertmanager read integration
- Deployment actions: restart, scale, rollback
- Server-side dry-run
- audit log detail
- multi-cluster list

필수 전제:

- 모든 mutation에 authorization check
- `dryRun=server`
- `resourceVersion` 기반 충돌 처리
- action log
- RBAC role 분리

### 9.3 Phase 3: Troubleshooting expansion

추가 가능 항목:

- Pod logs
- multi-container log selector
- log search/download
- exec terminal
- WebSocket transport

필수 전제:

- `pods/log`, `pods/exec` 별도 권한
- session recording 또는 audit 강화
- NetworkPolicy와 timeout
- 민감 정보 마스킹 정책

### 9.4 Phase 4: Platform expansion

추가 가능 항목:

- CRD browser
- plugin system
- GitOps read integration
- AI assistant

주의:

- CRD generic browser는 비전문가 UX와 충돌할 수 있다.
- GitOps 도구는 source of truth가 Kubernetes API가 아니라 Git repository일 수 있으므로 별도 정보 구조가 필요하다.

---

## 10. 보안 기준

### 10.1 Phase 1 RBAC 최소 권한

기본 reader 권장:

| API group | resources | verbs |
|---|---|---|
| core | `pods`, `nodes`, `namespaces`, `events` | `get`, `list`, `watch` |
| apps | `deployments`, `replicasets` | `get`, `list`, `watch` |

기본 reader 제외:

- `secrets`
- `configmaps`
- `serviceaccounts`
- `roles`, `rolebindings`, `clusterroles`, `clusterrolebindings`
- `pods/log`
- `pods/exec`
- `nodes/proxy`
- wildcard resources
- wildcard verbs
- mutation verbs

### 10.2 인증과 사용자 신원

권장:

- OIDC 기반 로그인
- httpOnly, Secure, SameSite cookie
- BFF -> kube-apiserver는 user identity forwarding 또는 impersonation
- impersonation 사용 시 별도 ClusterRole, audit log, 제한 검토

주의:

- impersonation 권한은 namespace scoped가 아니다.
- BFF service account가 침해되면 impersonation 권한이 큰 blast radius를 만든다.
- Pod Security, NetworkPolicy, image hardening은 v1부터 필요하다.

근거:

- User Impersonation 공식 문서: https://kubernetes.io/docs/reference/access-authn-authz/user-impersonation/
- RBAC Good Practices: https://kubernetes.io/docs/concepts/security/rbac-good-practices/

---

## 11. 실시간 업데이트와 프론트엔드 전송

### 11.1 SSE 선택 근거

Phase 1은 서버에서 클라이언트로 상태 변경을 전달하는 단방향 흐름이다. MDN 문서는 SSE가 one-way connection이며 EventSource를 통해 서버 이벤트를 받을 수 있다고 설명한다. 따라서 Phase 1의 overview/pod/deployment/event update에는 SSE가 적합하다.

설계 결론:

- Phase 1: SSE
- Phase 3: exec/attach처럼 양방향 상호작용이 필요한 경우 WebSocket 추가
- HTTP/1.1에서 browser/domain당 SSE connection 제한이 있으므로 topic multiplexing이 필요하다.
- HTTP/2 환경에서는 동시 stream 수가 협상되지만, 여전히 화면별 SSE 남발은 피한다.

근거:

- MDN SSE: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events

### 11.2 stale 표시

SSE 연결이 끊기거나 informer cache가 오래되면 사용자는 오래된 상태를 최신 상태로 오해할 수 있다.

필수 UI:

- 상단 `Stale data` banner
- 마지막 업데이트 시각
- 재연결 중 표시
- manual refresh button

---

## 12. 검증 기준

### 12.1 문서 기반 acceptance criteria

Phase 1 설계가 완료되었다고 말하려면 다음이 충족되어야 한다.

| 항목 | 기준 |
|---|---|
| Overview 정보 구조 | health, node, pod, deployment, utilization, events, stale 상태가 정의됨 |
| Cluster 정보 구조 | namespace, deployment, pod row, filter, health reason이 정의됨 |
| Pod STATUS | `phase`와 `kubectl STATUS` 차이를 문서화하고 테스트 계획이 있음 |
| Deployment health | condition 기반 판정 순서가 있음 |
| Data source | K8s/Prometheus/PG 경계가 명확함 |
| RBAC | Phase 1 최소 권한과 제외 권한이 명시됨 |
| Extension | Phase 2/3 기능이 core를 깨지 않고 들어갈 위치가 있음 |
| Mock | mock이 official semantics와 contract를 검증하도록 연결됨 |

### 12.2 구현 전 테스트 계획

문서 이후 실제 구현 시 필요한 테스트:

1. Pod STATUS fixture test
   - Running
   - Running but not Ready
   - CrashLoopBackOff
   - ImagePullBackOff
   - OOMKilled
   - Init:0/2
   - Terminating
   - Unknown / NodeLost
2. Deployment health fixture test
   - Healthy
   - Progressing
   - ProgressDeadlineExceeded
   - ReplicaFailure
   - Available=False with partial ready
   - Available=False with zero ready
3. API contract test
   - mock JSON과 OpenAPI schema 일치
   - real response와 mock response schema 일치
4. RBAC test
   - Phase 1 reader로 필요한 endpoint 성공
   - Secrets, pods/exec, pods/log 실패
5. UI scenario test
   - healthy
   - degraded
   - critical
   - partial Prometheus down
   - stale SSE
   - 403 Forbidden

---

## 13. 참고 문헌

### 13.1 공식 문서

- Kubernetes Pod Lifecycle: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
- Kubernetes Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Kubernetes API Concepts: https://kubernetes.io/docs/reference/using-api/api-concepts/
- Kubernetes Event API: https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/
- Kubernetes RBAC: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
- Kubernetes RBAC Good Practices: https://kubernetes.io/docs/concepts/security/rbac-good-practices/
- Kubernetes User Impersonation: https://kubernetes.io/docs/reference/access-authn-authz/user-impersonation/
- Metrics Server: https://kubernetes-sigs.github.io/metrics-server/
- Google SRE Book - Monitoring Distributed Systems: https://sre.google/sre-book/monitoring-distributed-systems/
- MDN - Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events

### 13.2 논문 / 연구 문헌

- Burns, B., Grant, B., Oppenheimer, D. "Borg, Omega, and Kubernetes." ACM Queue, 2016. https://research.google/pubs/borg-omega-and-kubernetes/
- Verma, A. et al. "Large-scale cluster management at Google with Borg." EuroSys 2015. https://research.google/pubs/large-scale-cluster-management-at-google-with-borg/
- Schwarzkopf, M. et al. "Omega: flexible, scalable schedulers for large compute clusters." EuroSys 2013. https://research.google/pubs/omega-flexible-scalable-schedulers-for-large-compute-clusters/
- Endsley, M. R. "Toward a Theory of Situation Awareness in Dynamic Systems." Human Factors, 1995.
- Sweller, J. "Cognitive Load During Problem Solving: Effects on Learning." Cognitive Science, 1988.
- "Situation Awareness-Oriented Dashboard in ICUs in Support of Resource Management in Time of Pandemics." 2023. https://pmc.ncbi.nlm.nih.gov/articles/PMC9904450/

### 13.3 내부 설계 문서와 연결

이 문서는 업로드된 다음 기획 문서의 근거 레이어로 사용한다.

- `00_보강설계서_통합개요.md`
- `01_프론트엔드_디자인_기획서.md`
- `02_백엔드_API_비즈니스로직_기획서.md`
- `03_데이터베이스_기획서.md`
- `04_인프라_보안_운영_기획서.md`
- `05_Mockup_데이터_관리_기획서.md`

---

## 14. 엄격한 한계

1. 이 문서는 구현 완료 문서가 아니다. 구현 전 판단 기준 문서다.
2. 공식 Kubernetes 문서는 dashboard UX를 직접 검증하지 않는다. 본 문서는 Kubernetes 객체 semantics를 UI 설계에 적용한 것이다.
3. HCI/SRE 문헌은 Kubernetes 초보자가 실제로 5초 안에 이해한다는 보장을 제공하지 않는다. 실제 사용자 테스트가 필요하다.
4. Prometheus query와 threshold는 조직의 SLO와 cluster 운영 기준에 맞춰 조정해야 한다.
5. Phase 1에서 logs와 exec를 제외하면 장애 조사 깊이는 제한된다. 단, 보안과 범위 관점에서 core 이후 확장으로 두는 것이 타당하다.
