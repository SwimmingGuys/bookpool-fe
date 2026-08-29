<div align="center">

# 📚 BookPool

**서평단 · 베타리더 모집을 한곳에서 — 도서 리뷰어 모집 플랫폼**

출판사와 독자를 잇는 서평단/베타리더 모집 보드, 그리고 모집을 직접 운영하는 백오피스까지.

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com)

</div>

---

## ✨ 소개

**BookPool**은 출판사가 도서의 **서평단·베타리더를 모집**하고, 독자가 관심 도서의 모집 공고를 탐색·신청 흐름을 살펴볼 수 있는 한국어 웹 서비스입니다. 마감일 기반 **캘린더 보드**로 모집 일정을 한눈에 보고, 관심 분야·유형으로 필터링하며, 백오피스에서 모집글과 리뷰를 직접 관리합니다.

> 현재 프런트엔드는 BookPool 백엔드 API와 연동됩니다. 기본 API 주소는 `http://localhost:8080`이며, 다른 주소를 사용할 때는 `VITE_API_BASE_URL`을 설정하세요.

---

## 🧩 주요 기능

### 사용자 서비스
- **🏠 홈** — 히어로, 이용 안내, 카테고리 탐색, 마감 임박 주목 모집 큐레이션
- **🗓️ 모집 보드** — 캘린더 기반 일정 보기(모집 시작/마감 기준 전환), 검색·필터·정렬, 적용 필터 칩
- **📄 모집 상세** — 도서 소개·일정 안내, 조회수, ⭐ 즐겨찾기, 최근 본 공고 기록
- **🔐 인증** — 로그인 / 회원가입(이메일 인증 코드 흐름) / 비밀번호 찾기, 보호 라우트(`RequireAuth`)
- **👤 마이페이지** — 계정 설정·비밀번호 변경, 내 즐겨찾기·최근 본 모집, 알림 설정
- **🔔 알림** — 헤더 알림 벨 + 알림 목록
- **📢 공지사항** — 카테고리 배지, 상세 보기, 읽음 처리
- **💬 문의** — 1:1 문의 등록/조회

### 백오피스 (관리자)
- **🛡️ 관리자 인증** — 일반 사용자와 **완전히 분리된** 로그인/세션(`/admin/login`, `RequireAdmin`)
- **📝 서평단(모집글) 관리** — 등록·수정·삭제(CRUD), 목록에서 상태·기간 확인
- **🖼️ 표지 이미지 업로드** — 미리보기·용량 검증
- **⏱️ 기간 관리** — 모집 시작·마감·발표일 입력 및 검증, 마감일 기준 D-day·상태 자동 산출
- **⭐ 리뷰 관리** — 모집글별 리뷰 추가·수정·삭제, 노출/숨김 토글

> 관리자가 등록한 모집글은 공개 보드·홈·상세에 **mock 데이터와 합쳐 즉시 노출**됩니다.

---

## 🛠️ 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| **프레임워크** | React 19 + TypeScript |
| **빌드** | Vite 8 (`@tailwindcss/vite`) |
| **라우팅** | React Router v7 (`BrowserRouter`) |
| **스타일** | Tailwind CSS v4 (설정은 `src/index.css`), `clsx` + `tailwind-merge`(`cn()`) |
| **아이콘** | lucide-react |
| **상태 관리** | `useSyncExternalStore` 기반 자체 외부 스토어 (상태 라이브러리 미사용) |
| **품질** | ESLint, `tsc -b` 타입 체크 |

---

## 🚀 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 (HMR)
npm run dev

# 타입 체크 + 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# 린트
npm run lint
```

> 별도의 테스트 러너는 없으며, 타입 체크는 `npx tsc -b`로 단독 실행할 수 있습니다.

### 백엔드 API 주소

```bash
# 기본값: http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

회원가입 이메일 인증 코드는 백엔드 설정에 따라 메일 또는 서버 로그로 발송됩니다. 관리자 페이지는 백엔드의 `ADMIN` 권한 계정으로 로그인해야 접근할 수 있습니다.

---

## 🏗️ 아키텍처 한눈에 보기

- **백엔드 API 연동** — `src/lib/api`의 HTTP 클라이언트가 Spring 백엔드의 `/api/*` 엔드포인트를 호출합니다.
- **자체 외부 스토어** — Context/Redux 대신 `useSyncExternalStore`를 사용합니다.
  - `lib/createStore.ts` — `localStorage` 영속화 + 탭 간 동기화를 지원하는 제네릭 스토어 (`auth`, `toast`, `admin-auth` 등)
  - API 기반 모듈 스토어 — 모집글·즐겨찾기·최근 본·알림·문의 등
- **타입드 에러** — 인증 흐름은 `AuthError`/`AdminAuthError`로 `code`별 분기, 한국어 `message` 노출
- **결정론적 날짜** — `lib/date.ts`의 고정 "오늘"(`TODAY_ISO`)을 기준으로 캘린더·mock 데이터가 매 실행마다 동일하게 유지됩니다.
- **한국어 UI** — 모든 사용자 노출 문구는 한국어, 도메인 값(모집 유형 등)은 라벨 맵으로 변환합니다.

### 디렉터리 구조

```
src/
├─ pages/            # 라우트 단위 페이지 (home, board, mypage, admin …)
├─ components/       # ui · auth · board · home · layout · admin · notice
├─ lib/              # API 클라이언트 · 스토어 · 유틸 (auth, adminRecruitments, recruitmentsSource …)
├─ data/             # 이전 mock 데이터 / 로컬 데모 보조 데이터
└─ types/            # 도메인 타입 (recruitment, user, admin, review …)
```

### 라우트 맵

| 경로 | 설명 | 접근 |
| --- | --- | --- |
| `/` | 홈 | 공개 |
| `/board`, `/recruitments/:id` | 모집 보드·상세 | 공개 |
| `/notice`, `/notice/:id` | 공지사항 | 공개 |
| `/login`, `/signup`, `/forgot-password` | 인증 | 공개 |
| `/mypage/*`, `/notifications`, `/support` | 마이페이지·알림·문의 | 로그인 필요 |
| `/admin/login` | 관리자 로그인 | 공개 |
| `/admin/recruitments`, `/admin/recruitments/new`, `/admin/recruitments/:id` | 백오피스 서평단·리뷰 관리 | 관리자 필요 |

---

<div align="center">

Made with ☕ & 📚 — **BookPool**

</div>
