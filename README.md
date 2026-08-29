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

**BookPool**은 출판사가 도서의 **서평단·베타리더를 모집**하고, 독자가 관심 도서의 공고를 찾아 **신청하고 서평까지 남기는** 한국어 웹 서비스입니다. 마감일 캘린더로 일정을 한눈에 보고, 관심 분야·유형으로 좁혀 보며, 백오피스에서 공고·서평·공지·문의를 직접 운영합니다.

> 프런트엔드는 BookPool 백엔드 API와 연동됩니다. 항상 같은 오리진의 `/api`로 호출하고, 개발 중에는 Vite 프록시가 백엔드로 넘깁니다.

---

## 🧩 주요 기능

### 사용자 서비스
- **🏠 홈** — 히어로, 이용 안내, 카테고리별 모집중 건수, 마감 임박 큐레이션
- **🗓️ 모집 보드** — 캘린더 보기(모집 시작 / 마감 / 발표일 기준 전환), **서버 검색·필터·정렬**과 더 보기, 적용 필터 칩, **즐겨찾기만 보기**
- **📄 모집 상세** — 도서 소개·일정, **모집 조건**(인원·제공 형태·서평 의무 채널·제출 기한·신청 자격), **신청하기 CTA**, 공유, ⭐ 즐겨찾기, 조회수
- **✍️ 서평** — 참여자가 원문 링크로 서평을 제출하고, 인증된 서평이 공고에 노출
- **🏢 출판사 페이지** — 출판사별 모집 모아보기
- **🔐 인증** — 로그인 / 회원가입(이메일 인증) / 비밀번호 찾기, 토큰 자동 재발급, 보호 라우트(`RequireAuth`)
- **👤 마이페이지** — 계정 설정·비밀번호 변경, 최근 본 공고 · 즐겨찾기 · **내 서평**, 알림 설정
- **🔔 알림** — 헤더 알림 벨 + 알림 목록(읽음 처리), 조건 구독, 이메일 수신 동의
- **📢 공지사항** — 카테고리 필터, 상세 보기, 읽음 처리
- **💬 문의** — 1:1 문의 등록/조회

### 백오피스 (관리자)
- **🛡️ 관리자 인증** — 일반 사용자와 **완전히 분리된** 로그인/세션(`/admin/login`, `RequireAdmin`)
- **📝 서평단 관리** — 등록·수정·삭제, **검수 대기(draft) ↔ 게시(published)** 탭, 모집 마감 수동 전환, 신청 링크 누락 표시
- **🖼️ 표지 이미지 업로드** — 서버 업로드 후 URL 저장
- **⭐ 서평 인증** — 제출된 서평 승인 / 반려(사유) / 노출·숨김 / 삭제
- **📢 공지사항 관리** — 작성·수정·삭제, 상단 고정
- **💬 문의 관리** — 상태별 조회, 답변 등록·수정

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
| **품질** | ESLint(react-hooks v7), `tsc -b` 타입 체크 |

---

## 🚀 시작하기

```bash
npm install
npm run dev      # 개발 서버 (HMR)
npm run build    # 타입 체크 + 프로덕션 빌드
npm run preview  # 프로덕션 빌드 미리보기
npm run lint     # 린트
```

별도의 테스트 러너는 없으며, 타입 체크는 `npx tsc -b`로 단독 실행할 수 있습니다.

### 백엔드 연결

프런트는 항상 같은 오리진의 `/api`로 호출합니다. 개발 중에는 Vite dev 서버가 이를 백엔드로 프록시합니다.

```bash
# .env.development
VITE_API_PROXY_TARGET=http://localhost:8080
```

프록시를 쓰지 않고 다른 오리진으로 직접 호출하려면 `/api`까지 포함한 전체 주소를 지정합니다.

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

회원가입 이메일 인증 코드는 백엔드 설정에 따라 메일 또는 서버 로그로 발송됩니다. 백오피스는 백엔드의 `ADMIN` 권한 계정으로 로그인해야 접근할 수 있습니다.

---

## 🏗️ 아키텍처 한눈에 보기

- **단일 HTTP 클라이언트** — 모든 요청이 `lib/api/client.ts`를 거칩니다. 엔드포인트는 `ENDPOINTS` 한 곳에 모으고, 백엔드 `ApiResult<T>` 껍데기를 벗겨 `data`만 돌려줍니다. 401이면 `/reissue`로 한 번 재발급 후 재시도합니다.
- **타입드 에러** — 모든 실패는 `.code`(`ApiErrorCode`)와 한국어 `.message`를 가진 `AuthError`로 던집니다. 호출부는 `.code`로 분기합니다.
- **분리된 관리자 세션** — 관리자 토큰은 별도 스토어에 두고 `apiRequest`의 `token` 옵션으로만 실어 보냅니다.
- **조회 상태 훅** — `useAsyncData`가 로딩·에러·재시도를 담당하고, 화면은 스켈레톤 / `ErrorState` / `EmptyState` 세 상태를 모두 그립니다.
- **서버사이드 검색** — 검색·필터·정렬·페이지네이션은 서버가 합니다. 클라이언트 필터는 즐겨찾기 보기처럼 이미 전부 받아둔 목록에만 씁니다.
- **자체 외부 스토어** — Context/Redux 대신 `useSyncExternalStore`. `createStore`(영속·탭 간 동기화)와 사용자별 모듈 스토어(즐겨찾기·최근 본·알림)를 함께 씁니다.
- **한국어 UI** — 모든 사용자 노출 문구는 한국어, 도메인 값은 라벨 맵으로 변환합니다.

### 디렉터리 구조

```
src/
├─ pages/            # 라우트 단위 페이지 (home, board, mypage, admin …)
├─ components/       # ui · auth · board · home · layout · recruitment · notice · admin
├─ lib/
│  ├─ api/           # HTTP 클라이언트 · 도메인별 API 모듈
│  └─ …              # 스토어 · 훅 · 유틸 (auth, recruitmentsSource, useAsyncData …)
└─ types/            # 도메인 타입 (recruitment, user, review, notice, inquiry …)
```

### 라우트 맵

| 경로 | 설명 | 접근 |
| --- | --- | --- |
| `/` | 홈 | 공개 |
| `/board`, `/recruitments/:id` | 모집 보드·상세 | 공개 |
| `/publishers/:name` | 출판사별 모집 | 공개 |
| `/notice`, `/notice/:id` | 공지사항 | 공개 |
| `/login`, `/signup`, `/forgot-password` | 인증 | 공개 |
| `/mypage/*`, `/notifications`, `/support` | 마이페이지·알림·문의 | 로그인 필요 |
| `/admin/login` | 관리자 로그인 | 공개 |
| `/admin/recruitments`, `/admin/notices`, `/admin/inquiries` | 백오피스 | 관리자 필요 |

> `vercel.json`이 `/api` 외 모든 경로를 `index.html`로 rewrite합니다. 이 설정이 없으면 상세 링크를 직접 열 때 404가 납니다.

### 크롤링 도입 준비

지금은 관리자가 공고를 직접 등록하지만, 나중에 인스타그램 등에서 수집할 것을 전제로 스키마와 운영 화면을 미리 맞춰 두었습니다.

- `source` · `sourceUrl` · `collectedAt` — 공고의 출처와 원문 링크
- `publishStatus` — 수집된 공고는 `draft`(검수 대기)로 들어와 백오피스의 같은 화면에서 검수 후 `published`로 전환
- `recruitmentDedupeKey()` — 도서명 + 출판사 + 마감일로 중복 수집을 판별

---

<div align="center">

Made with ☕ & 📚 — **BookPool**

</div>
