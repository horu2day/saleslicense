import { useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { trpc } from "@/lib/trpc";
import { useCallback, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Clerk 기반 인증 훅
 *
 * Clerk의 인증 상태와 DB의 사용자 정보를 통합합니다.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/" } =
    options ?? {};

  // Clerk 상태
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut, openSignIn } = useClerk();
  const { isLoaded: authLoaded } = useClerkAuth();

  // DB에서 사용자 정보 조회 (Clerk 로그인 시에만)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isSignedIn === true, // Clerk 로그인 시에만 쿼리 실행
  });

  const logout = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
    }
  }, [signOut]);

  const login = useCallback(() => {
    openSignIn({
      afterSignInUrl: redirectPath,
    });
  }, [openSignIn, redirectPath]);

  const state = useMemo(() => {
    // Clerk 로딩 중
    if (!clerkLoaded || !authLoaded) {
      return {
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
      };
    }

    // Clerk에서 로그아웃 상태
    if (!isSignedIn) {
      return {
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      };
    }

    // DB 사용자 정보 로딩 중
    if (meQuery.isLoading) {
      return {
        user: null,
        loading: true,
        error: null,
        isAuthenticated: true,
      };
    }

    // DB에 사용자 정보가 있음
    if (meQuery.data) {
      localStorage.setItem(
        "clerk-user-info",
        JSON.stringify(meQuery.data)
      );
      return {
        user: meQuery.data,
        loading: false,
        error: null,
        isAuthenticated: true,
      };
    }

    // Clerk에는 로그인되어 있지만 DB에 정보가 없는 경우
    // (첫 로그인 시 서버에서 자동 생성됨)
    return {
      user: clerkUser ? {
        id: 0,
        openId: clerkUser.id,
        name: clerkUser.fullName || clerkUser.username || null,
        email: clerkUser.emailAddresses[0]?.emailAddress || null,
        role: "user" as const,
        loginMethod: null,
        createdAt: new Date(),
        lastSignedIn: new Date(),
      } : null,
      loading: false,
      error: meQuery.error ?? null,
      isAuthenticated: true,
    };
  }, [
    clerkLoaded,
    authLoaded,
    isSignedIn,
    clerkUser,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
    login,
    clerkUser, // Clerk 사용자 정보 직접 접근용
  };
}
