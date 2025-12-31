# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

SoftHub은 검로드(Gumroad) 스타일의 소프트웨어 라이선스 판매 플랫폼입니다. 판매자는 소프트웨어 제품을 등록하고, 라이선스 키를 생성하며, 판매 현황을 추적할 수 있습니다. 구매자는 소프트웨어를 구매하고, 라이선스 키를 받아 제품을 다운로드할 수 있습니다.

## 명령어

```bash
pnpm dev          # 개발 서버 시작 (tsx watch + vite)
pnpm build        # 프로덕션 빌드 (vite + esbuild)
pnpm start        # 프로덕션 빌드 실행
pnpm test         # 테스트 실행 (vitest)
pnpm check        # TypeScript 타입 체크 (tsc --noEmit)
pnpm format       # Prettier로 코드 포맷팅
pnpm db:push      # Drizzle 마이그레이션 생성 및 실행
```

단일 테스트 파일 실행:
```bash
pnpm vitest run server/api.test.ts
```

## 아키텍처

### 모노레포 구조
- **client/** - React 프론트엔드 (Vite)
- **server/** - Express 백엔드 + tRPC
- **shared/** - 클라이언트/서버 공유 타입 및 상수
- **drizzle/** - 데이터베이스 스키마 및 마이그레이션

### 기술 스택
- **프론트엔드**: React 19, Vite, TailwindCSS v4, shadcn/ui (new-york 스타일), wouter (라우팅), TanStack Query
- **백엔드**: Express, tRPC v11, Drizzle ORM, PostgreSQL
- **결제**: 토스페이먼츠 V1 API (개별 연동 방식 - 최소 결제 금액 제한 없음)
- **인증**: Clerk (Google, GitHub, Email 등 다양한 로그인 지원)

### 클라이언트-서버 통신

tRPC로 엔드투엔드 타입 안전성 제공:

```typescript
// 클라이언트: client/src/lib/trpc.ts
const { data } = trpc.products.list.useQuery({ limit: 20, offset: 0 });

// 서버: server/routers.ts
products: router({
  list: publicProcedure
    .input(z.object({ limit: z.number(), offset: z.number() }))
    .query(async ({ input }) => getProducts(input.limit, input.offset)),
})
```

API 엔드포인트: `/api/trpc`

### tRPC Procedure 타입

`server/_core/trpc.ts`에 정의:
- `publicProcedure` - 인증 불필요
- `protectedProcedure` - 로그인 필요
- `adminProcedure` - 관리자 권한 필요

### 데이터베이스 스키마

`drizzle/schema.ts`에 정의된 주요 테이블:
- `users` - 사용자 (user/admin 역할)
- `products` - 소프트웨어 제품 (가격, 라이선스 타입)
- `licenseKeys` - 라이선스 키 (상태 추적)
- `orders` - 주문 내역
- `reviews` - 제품 리뷰 및 별점
- `downloads` - 다운로드 기록
- `sellerProfiles` - 판매자 프로필

### 경로 별칭 (Path Aliases)

`vite.config.ts` 및 `vitest.config.ts`에 설정:
- `@/` → `client/src/`
- `@shared/` → `shared/`
- `@assets/` → `attached_assets/`

## 주요 파일

- `server/routers.ts` - 모든 tRPC API 라우트
- `server/db.ts` - 데이터베이스 쿼리
- `server/payment.ts` - 토스페이먼츠 연동
- `server/_core/index.ts` - Express 서버 설정
- `client/src/App.tsx` - React 라우트
- `drizzle/schema.ts` - 데이터베이스 스키마

## 환경 변수

필수 환경 변수:
- `DATABASE_URL` - PostgreSQL 연결 문자열
- `TOSS_SECRET_KEY` - 토스페이먼츠 시크릿 키 (API 개별 연동용)
- `VITE_TOSS_CLIENT_KEY` - 토스페이먼츠 클라이언트 키 (API 개별 연동용)
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk Publishable Key (클라이언트용)
- `CLERK_SECRET_KEY` - Clerk Secret Key (서버용)

**토스페이먼츠 API 키 발급**:

- 테스트 키: [토스페이먼츠 개발자센터](https://developers.tosspayments.com/my/api-keys)
- API 개별 연동 방식을 사용하므로 결제 위젯과 달리 최소 결제 금액 제한이 없습니다
- 상점아이디(MID)별로 다른 키를 사용합니다

**Clerk 키 발급**:

- [Clerk Dashboard](https://dashboard.clerk.com)에서 발급받을 수 있습니다

## UI 컴포넌트

shadcn/ui (new-york 스타일) 사용. 컴포넌트 위치: `client/src/components/ui/`

새 컴포넌트 추가:
```bash
npx shadcn@latest add [component-name]
```
