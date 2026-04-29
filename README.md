# KubernetesDashboard
여기서부터 시작하는 쿠버네티스 대시보드 (브랜드명: **KubeControl**)

## 설계 문서

- [KubernetesDashboard Overview / Cluster 코어 설계 근거 문서](docs/kubernetes-dashboard-overview-cluster-research.md)

## 프런트엔드 (Phase 1 셸)

React 18 + TypeScript + Vite + Tailwind CSS 3 기반의 Overview/Cluster 셸을 포함한다. 본 셸은 의도적으로 **목업 데이터를 포함하지 않으며**, 페이지 구조·레이아웃·타입·라우팅만 정의한다. 데이터 연결은 BFF/API 계약이 확정된 다음 단계에서 추가한다.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 타입 체크 + 프로덕션 번들 생성
npm run typecheck  # 타입만 검사
```

주요 디렉터리:

```
src/
├── app/                # 라우트 트리, 최상위 컴포지션
├── components/
│   ├── icons/          # Material Symbols 래퍼
│   └── layout/         # AppLayout / SideNavBar / TopAppBar
├── features/
│   ├── overview/       # Overview 페이지와 하위 카드들
│   └── cluster/        # Cluster 페이지 placeholder
├── styles/             # 전역 CSS / Tailwind entry
└── types/              # 도메인 타입 (ClusterOverview 등)
```
