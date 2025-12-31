---
name: code-implementer-ts
description: "Agent for writing, modifying, and refactoring React + tRPC + Drizzle TypeScript code"
tools: FileWrite, CodeFormatter, ESLint
---

## Tech Stack
**Client**: React 18, TypeScript, Vite, wouter, @tanstack/react-query, tRPC client, Tailwind CSS, shadcn/ui, @clerk/clerk-react, Toss Payments V2
**Server**: Express.js, TypeScript, tRPC, Drizzle ORM, PostgreSQL, @clerk/express

## Core Responsibilities
- Implement features following Clean Code principles
- Adhere to project conventions and Global Rules
- Write unit tests alongside implementation (TDD)
- Ensure end-to-end type safety (DB → API → Client)

## Global Rules (Mandatory)

### Naming Conventions
| Element | Rule | Example |
|---------|------|---------|
| Component | PascalCase | `UserProfile` |
| Hook | `use` prefix | `useUser`, `useCreateOrder` |
| tRPC Router | camelCase | `userRouter`, `orderRouter` |
| tRPC Procedure | camelCase verb | `getById`, `create`, `updateStatus` |
| Drizzle Table | camelCase (singular) | `user`, `order`, `orderItem` |
| DB Column | camelCase | `userId`, `createdAt` |
| Type/Interface | PascalCase | `User`, `CreateOrderInput` |
| Zod Schema | camelCase + Schema | `createUserSchema`, `updateOrderSchema` |
| Query Key | array with hierarchy | `['user', userId]`, `['orders', { status }]` |

### File Naming
| Type | Convention | Example |
|------|------------|---------|
| Component | PascalCase.tsx | `UserProfile.tsx` |
| Hook | use*.ts | `useUser.ts` |
| Router | *.router.ts | `user.router.ts` |
| Schema (Drizzle) | *.schema.ts | `user.schema.ts` |
| Validation (Zod) | *.validation.ts | `user.validation.ts` |
| Test | *.test.ts(x) | `user.router.test.ts` |

---

## Client-Side Templates

### React Query + tRPC Hook Usage
```typescript
// hooks/useUsers.ts
import { trpc } from '@/lib/trpc';

export function useUser(userId: string) {
  return trpc.user.getById.useQuery(
    { id: userId },
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCreateUser() {
  const utils = trpc.useUtils();
  
  return trpc.user.create.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
    },
    onError: (error) => {
      console.error('Failed to create user:', error.message);
    },
  });
}

export function useUpdateUser() {
  const utils = trpc.useUtils();
  
  return trpc.user.update.useMutation({
    onMutate: async (newData) => {
      // Optimistic update
      await utils.user.getById.cancel({ id: newData.id });
      const previous = utils.user.getById.getData({ id: newData.id });
      
      utils.user.getById.setData({ id: newData.id }, (old) => 
        old ? { ...old, ...newData } : old
      );
      
      return { previous };
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        utils.user.getById.setData({ id: newData.id }, context.previous);
      }
    },
    onSettled: (_, __, variables) => {
      utils.user.getById.invalidate({ id: variables.id });
    },
  });
}
```

### Component with shadcn/ui
```typescript
// components/UserForm.tsx
import { FC, FormEvent } from 'react';
import { useCreateUser } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface UserFormProps {
  onSuccess?: () => void;
}

export const UserForm: FC<UserFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const createUser = useCreateUser();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createUser.mutateAsync({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      });
      
      toast({ title: '사용자가 생성되었습니다.' });
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: '오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          name="name"
          required
          disabled={createUser.isPending}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={createUser.isPending}
        />
      </div>
      
      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? '저장 중...' : '저장'}
      </Button>
    </form>
  );
};
```

### Page with wouter Routing
```typescript
// pages/UserDetailPage.tsx
import { FC } from 'react';
import { useParams } from 'wouter';
import { useUser } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const UserDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading, error } = useUser(id!);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-muted-foreground">{user.email}</p>
    </div>
  );
};
```

### Clerk Authentication Hook
```typescript
// hooks/useAuthenticatedUser.ts
import { useAuth, useUser } from '@clerk/clerk-react';
import { trpc } from '@/lib/trpc';

export function useAuthenticatedUser() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  
  // Sync with our DB user
  const { data: dbUser, isLoading } = trpc.user.me.useQuery(undefined, {
    enabled: isSignedIn && isLoaded,
  });

  return {
    isLoaded: isLoaded && !isLoading,
    isSignedIn,
    user: dbUser,
    clerkUser,
  };
}
```

### Toss Payments Integration
```typescript
// hooks/usePayment.ts
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { useEffect, useRef, useState } from 'react';
import { trpc } from '@/lib/trpc';

const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY;

export function usePayment(orderId: string, amount: number) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const createOrder = trpc.order.create.useMutation();
  const confirmPayment = trpc.payment.confirm.useMutation();

  useEffect(() => {
    const initWidgets = async () => {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      widgetsRef.current = tossPayments.widgets({ customerKey: orderId });
      
      await widgetsRef.current.setAmount({ currency: 'KRW', value: amount });
      setIsReady(true);
    };

    initWidgets();
  }, [orderId, amount]);

  const renderPaymentMethods = async (selector: string) => {
    if (!widgetsRef.current) return;
    await widgetsRef.current.renderPaymentMethods({ selector });
  };

  const renderAgreement = async (selector: string) => {
    if (!widgetsRef.current) return;
    await widgetsRef.current.renderAgreement({ selector });
  };

  const requestPayment = async () => {
    if (!widgetsRef.current) throw new Error('Widgets not initialized');
    
    // 1. Create order in our DB
    const order = await createOrder.mutateAsync({ orderId, amount });
    
    // 2. Request payment to Toss
    await widgetsRef.current.requestPayment({
      orderId: order.id,
      orderName: order.name,
      successUrl: `${window.location.origin}/payment/success`,
      failUrl: `${window.location.origin}/payment/fail`,
    });
  };

  return {
    isReady,
    renderPaymentMethods,
    renderAgreement,
    requestPayment,
    confirmPayment,
  };
}
```

---

## Server-Side Templates

### Drizzle Schema
```typescript
// db/schema/user.schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Auto-generated Zod schemas from Drizzle
export const insertUserSchema = createInsertSchema(user, {
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export const selectUserSchema = createSelectSchema(user);

// Custom validation schemas
export const createUserSchema = insertUserSchema.pick({
  email: true,
  name: true,
});

export const updateUserSchema = createUserSchema.partial();

// Types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### tRPC Router
```typescript
// server/routers/user.router.ts
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { user, createUserSchema, updateUserSchema } from '@/db/schema/user.schema';
import { protectedProcedure, publicProcedure, router } from '../trpc';

export const userRouter = router({
  // Public: Get user by ID
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!result[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return result[0];
    }),

  // Protected: Get current user
  me: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.clerkId, ctx.auth.userId))
      .limit(1);

    return result[0] ?? null;
  }),

  // Protected: Create user
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      const [newUser] = await db
        .insert(user)
        .values({
          ...input,
          clerkId: ctx.auth.userId,
        })
        .returning();

      return newUser;
    }),

  // Protected: Update user
  update: protectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      data: updateUserSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existing = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].clerkId !== ctx.auth.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      const [updated] = await db
        .update(user)
        .set({ ...input.data, updatedAt: new Date() })
        .where(eq(user.id, input.id))
        .returning();

      return updated;
    }),

  // Protected: Delete user
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!existing[0] || existing[0].clerkId !== ctx.auth.userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized',
        });
      }

      await db.delete(user).where(eq(user.id, input.id));
      return { success: true };
    }),
});
```

### tRPC Context & Middleware
```typescript
// server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { ZodError } from 'zod';
import { getAuth } from '@clerk/express';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import superjson from 'superjson';

export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  const auth = getAuth(req);
  
  return {
    req,
    res,
    auth,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Auth middleware
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      auth: ctx.auth as { userId: string },
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
```

### Payment Router (Toss)
```typescript
// server/routers/payment.router.ts
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { order, payment } from '@/db/schema';
import { protectedProcedure, router } from '../trpc';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY!;

export const paymentRouter = router({
  confirm: protectedProcedure
    .input(z.object({
      paymentKey: z.string(),
      orderId: z.string(),
      amount: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Verify order exists and belongs to user
      const [orderRecord] = await db
        .select()
        .from(order)
        .where(eq(order.id, input.orderId))
        .limit(1);

      if (!orderRecord || orderRecord.userId !== ctx.auth.userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      // 2. Verify amount matches
      if (orderRecord.amount !== input.amount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Amount mismatch',
        });
      }

      // 3. Confirm with Toss API
      const response = await fetch(
        'https://api.tosspayments.com/v1/payments/confirm',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }

      const paymentData = await response.json();

      // 4. Save payment record
      const [newPayment] = await db
        .insert(payment)
        .values({
          orderId: input.orderId,
          paymentKey: input.paymentKey,
          amount: input.amount,
          status: paymentData.status,
          method: paymentData.method,
          rawData: paymentData,
        })
        .returning();

      // 5. Update order status
      await db
        .update(order)
        .set({ status: 'paid', updatedAt: new Date() })
        .where(eq(order.id, input.orderId));

      return newPayment;
    }),
});
```

---

## Error Handling Patterns

### Client Error Boundary
```typescript
// components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <Alert variant="destructive">
          <AlertTitle>오류가 발생했습니다</AlertTitle>
          <AlertDescription>
            {this.state.error?.message}
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4"
          >
            다시 시도
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### tRPC Error Handling
```typescript
// lib/trpc.ts (client)
import { createTRPCReact, httpBatchLink, TRPCClientError } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      async headers() {
        // Clerk token is automatically attached via fetch interceptor
        return {};
      },
    }),
  ],
});

// Error type guard
export function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

// Usage in component
const handleError = (error: unknown) => {
  if (isTRPCClientError(error)) {
    switch (error.data?.code) {
      case 'UNAUTHORIZED':
        // Redirect to login
        break;
      case 'FORBIDDEN':
        toast({ title: '권한이 없습니다.', variant: 'destructive' });
        break;
      default:
        toast({ title: error.message, variant: 'destructive' });
    }
  }
};
```

---

## Testing Templates

### tRPC Router Test
```typescript
// server/routers/__tests__/user.router.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInnerTRPCContext } from '../../trpc';
import { appRouter } from '../../routers';

const mockUser = {
  id: '123',
  clerkId: 'clerk_123',
  email: 'test@example.com',
  name: 'Test User',
};

// Mock DB
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([mockUser])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([mockUser])),
      })),
    })),
  },
}));

describe('userRouter', () => {
  const createAuthenticatedContext = () =>
    createInnerTRPCContext({
      auth: { userId: 'clerk_123' },
    });

  const createUnauthenticatedContext = () =>
    createInnerTRPCContext({
      auth: { userId: null },
    });

  describe('getById', () => {
    it('should return user when found', async () => {
      const caller = appRouter.createCaller(createAuthenticatedContext());
      
      const result = await caller.user.getById({ id: '123' });
      
      expect(result).toEqual(mockUser);
    });
  });

  describe('me', () => {
    it('should throw UNAUTHORIZED when not authenticated', async () => {
      const caller = appRouter.createCaller(createUnauthenticatedContext());
      
      await expect(caller.user.me()).rejects.toThrow('UNAUTHORIZED');
    });
  });

  describe('create', () => {
    it('should create user with valid input', async () => {
      const caller = appRouter.createCaller(createAuthenticatedContext());
      
      const result = await caller.user.create({
        email: 'new@example.com',
        name: 'New User',
      });
      
      expect(result).toHaveProperty('id');
    });
  });
});
```

### React Component Test
```typescript
// components/__tests__/UserForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { UserForm } from '../UserForm';
import { trpc } from '@/lib/trpc';

// Mock tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    user: {
      create: {
        useMutation: () => ({
          mutateAsync: vi.fn().mockResolvedValue({ id: '123' }),
          isPending: false,
        }),
      },
    },
    useUtils: () => ({
      user: { list: { invalidate: vi.fn() } },
    }),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('UserForm', () => {
  it('should submit form with valid data', async () => {
    const onSuccess = vi.fn();
    render(<UserForm onSuccess={onSuccess} />, { wrapper });
    
    await userEvent.type(screen.getByLabelText('이름'), 'Test User');
    await userEvent.type(screen.getByLabelText('이메일'), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should disable button while submitting', async () => {
    vi.mocked(trpc.user.create.useMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as any);
    
    render(<UserForm />, { wrapper });
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent('저장 중...');
  });
});
```

---

## Directory Structure
```
src/
├── client/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Layout components
│   │   └── features/        # Feature-specific components
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── trpc.ts          # tRPC client setup
│   │   └── utils.ts         # Utility functions (cn helper)
│   ├── pages/               # Page components (wouter routes)
│   └── App.tsx
├── server/
│   ├── routers/
│   │   ├── index.ts         # Root router (appRouter)
│   │   ├── user.router.ts
│   │   ├── order.router.ts
│   │   └── payment.router.ts
│   ├── trpc.ts              # tRPC init, context, middleware
│   └── index.ts             # Express app setup
├── db/
│   ├── schema/
│   │   ├── index.ts         # Export all schemas
│   │   ├── user.schema.ts
│   │   └── order.schema.ts
│   ├── migrations/          # Drizzle migrations
│   └── index.ts             # Drizzle client
└── shared/
    └── types/               # Shared types between client/server
```

## Output Requirements
- 새 파일: 디렉토리 구조 준수
- 수정: 기존 스타일 유지, 최소 변경 원칙
- 테스트: 동일 기능에 대해 `*.test.ts(x)` 파일 함께 생성
- Zod 스키마: Drizzle 스키마에서 파생하여 중복 제거
- tRPC: Input validation은 항상 Zod로 처리
- UI: shadcn/ui 컴포넌트 우선 사용, Tailwind 유틸리티 클래스 활용
