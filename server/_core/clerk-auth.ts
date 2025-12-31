import { clerkClient, verifyToken } from "@clerk/express";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

/**
 * Clerk 인증 서비스
 *
 * Clerk의 JWT 토큰을 검증하고 사용자 정보를 동기화합니다.
 */

/**
 * Authorization 헤더에서 Bearer 토큰 추출
 */
function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Clerk 토큰을 검증하고 사용자 정보를 반환합니다.
 *
 * 흐름:
 * 1. Authorization 헤더에서 JWT 토큰 추출
 * 2. Clerk API로 토큰 검증
 * 3. 사용자 정보 조회 또는 생성
 * 4. DB에 사용자 동기화
 */
export async function authenticateClerkRequest(req: Request): Promise<User | null> {
  const token = extractBearerToken(req);

  if (!token) {
    return null;
  }

  // Clerk 키가 설정되지 않은 경우
  if (!ENV.clerkSecretKey) {
    console.warn("[Clerk Auth] CLERK_SECRET_KEY가 설정되지 않았습니다.");
    return null;
  }

  try {
    // Clerk SDK로 토큰 검증 (서버 사이드)
    const verifiedToken = await verifyToken(token, {
      secretKey: ENV.clerkSecretKey,
    });

    if (!verifiedToken || !verifiedToken.sub) {
      console.warn("[Clerk Auth] Invalid token - no subject");
      return null;
    }

    const clerkUserId = verifiedToken.sub;

    // Clerk에서 사용자 상세 정보 가져오기
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    if (!clerkUser) {
      console.warn("[Clerk Auth] User not found in Clerk");
      return null;
    }

    // 이메일 주소 추출 (primary email 우선)
    const primaryEmail = clerkUser.emailAddresses.find(
      (emailAddr) => emailAddr.id === clerkUser.primaryEmailAddressId
    );
    const email = primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? null;

    // 이름 추출
    const name = clerkUser.firstName
      ? `${clerkUser.firstName}${clerkUser.lastName ? " " + clerkUser.lastName : ""}`
      : clerkUser.username ?? null;

    // 로그인 방법 추출 (외부 계정 기반)
    let loginMethod: string | null = null;
    if (clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0) {
      loginMethod = clerkUser.externalAccounts[0].provider;
    } else if (email) {
      loginMethod = "email";
    }

    // DB에 사용자 upsert
    await db.upsertUser({
      openId: clerkUserId, // Clerk의 user ID를 openId로 사용
      name,
      email,
      loginMethod,
      lastSignedIn: new Date(),
    });

    // DB에서 사용자 조회
    const user = await db.getUserByOpenId(clerkUserId);

    if (!user) {
      console.error("[Clerk Auth] Failed to upsert user to database");
      return null;
    }

    return user;
  } catch (error) {
    console.error("[Clerk Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Clerk 사용자 정보를 기반으로 세션 데이터 반환
 */
export function getClerkSessionData(user: User) {
  return {
    userId: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
