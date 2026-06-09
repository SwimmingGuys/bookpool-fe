# 코드 스타일 규칙

이 프로젝트(React 19 + TypeScript + Vite)의 코드를 작성·수정할 때 따르는 컨벤션입니다.

## 포매팅

- **세미콜론 없음**, **작은따옴표(`'`)** 사용
- **2칸 들여쓰기**
- 여러 줄로 나뉜 배열/객체/인자 목록 끝에는 **trailing comma**를 붙인다
- 작성 후에는 `npm run lint`가 통과해야 한다

## Import

- 내부 모듈은 항상 **`@/` 별칭**으로 import한다. 상대 경로(`../`, `./`)는 쓰지 않는다
  - 예: `import { cn } from '@/lib/cn'`
- 타입 전용 import는 **inline `type`** 키워드를 쓴다 (`verbatimModuleSyntax` 활성)
  - 예: `import { forwardRef, type ButtonHTMLAttributes } from 'react'`
  - 예: `import type { Recruitment } from '@/types/recruitment'`

## 타입 정의

- 객체 형태(props, 상태, 응답)는 `interface`로, 유니온/별칭은 `type`으로 정의한다
  - 예: `interface ButtonProps { ... }`, `type Variant = 'primary' | 'secondary'`
- 컴포넌트 props는 `<ComponentName>Props` 이름의 `interface`로 분리한다
- 리터럴 배열/설정은 `as const`로 고정한다 (예: `CATEGORIES`)
- variant→클래스 매핑 등은 모듈 레벨에서 `Record<Union, string>` 형태로 선언한다
  - 예: `const variantStyles: Record<Variant, string> = { ... }`

## React 컴포넌트

- 컴포넌트는 `export default function ComponentName(props)` 형태로 작성한다
  - `forwardRef`가 필요하면 익명이 아닌 이름 있는 함수를 넘긴다: `forwardRef(function Button(...) {})`
- 파일명: 컴포넌트는 **PascalCase**(`Button.tsx`), lib 유틸은 **camelCase**(`authValidation.ts`)
- 이벤트 핸들러는 `handleXxx` 이름의 화살표 함수로 정의한다 (`handleSubmit`, `handleClick`)
- 파생 데이터는 `useMemo`로 계산한다
- 가드절(early return)을 선호한다: `if (!raw) return '/'`

## 스타일링 (Tailwind v4)

- 클래스 조합은 항상 **`cn()`**(`@/lib/cn`)으로 한다. 문자열 직접 연결(`+`, 템플릿)로 클래스를 만들지 않는다
- 조건부 클래스는 `cn(base, cond && 'extra', className)` 패턴을 쓴다
- 색 팔레트는 **stone**(중립)과 **orange**(강조) 계열을 기본으로 한다
- 컴포넌트는 마지막에 `className` prop을 받아 `cn()` 끝에 넘겨 오버라이드를 허용한다

## 상태 관리

- 로컬 상태는 `useState`를 쓴다
- 공유·영속 상태는 **새 상태 라이브러리를 도입하지 말고** `lib/`의 `useSyncExternalStore` 기반 스토어 패턴을 따른다 (`createStore` 또는 사용자별 모듈 스토어)
- `localStorage` 접근은 항상 `typeof window === 'undefined'` 가드와 `try/catch`로 감싼다

## 비동기 / 에러 처리

- 비동기 흐름은 `async/await` + `try/catch/finally`로 작성한다
- API 에러는 `AuthError`처럼 타입이 있는 에러로 던지고, 호출부에서 `err instanceof AuthError`로 분기해 `.code`로 판단하고 `.message`를 노출한다
- 사용자 피드백은 `showToast(message, variant)`(`@/lib/toast`)로 보여준다

## UI 문구

- 모든 사용자 노출 문구(라벨, 토스트, 에러 메시지)는 **한국어**로 작성한다
- `RecruitmentType` 같은 도메인 값은 한국어 문자열을 하드코딩하지 말고 `RECRUITMENT_TYPE_LABELS` 등 라벨 맵을 통해 변환한다
