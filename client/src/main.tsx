import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

// Clerk Publishable Key
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn("[Auth] VITE_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.");
}

const queryClient = new QueryClient();

// Clerk 세션 토큰을 포함하는 fetch wrapper
const createAuthenticatedFetch = (getToken: () => Promise<string | null>) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = await getToken();
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return globalThis.fetch(input, {
      ...(init ?? {}),
      headers,
      credentials: "include",
    });
  };
};

// tRPC Provider 래퍼 컴포넌트
function TrpcProviderWithAuth({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        fetch: createAuthenticatedFetch(getToken),
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}

// 에러 핸들링 설정
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) {
      // Clerk는 자동으로 로그인 페이지로 리다이렉트하므로 별도 처리 불필요
      console.warn("[API Query Error] Unauthorized - Clerk will handle redirect");
    } else {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    if (error instanceof TRPCClientError && error.message === UNAUTHED_ERR_MSG) {
      console.warn("[API Mutation Error] Unauthorized - Clerk will handle redirect");
    } else {
      console.error("[API Mutation Error]", error);
    }
  }
});

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY || ""}>
    <QueryClientProvider client={queryClient}>
      <TrpcProviderWithAuth>
        <App />
      </TrpcProviderWithAuth>
    </QueryClientProvider>
  </ClerkProvider>
);
