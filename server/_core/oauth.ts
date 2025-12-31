import type { Express, Request, Response } from "express";

/**
 * OAuth 라우트 등록
 *
 * Clerk 사용으로 인해 기존 OAuth 콜백 라우트는 더 이상 필요하지 않습니다.
 * Clerk이 모든 인증 흐름을 자동으로 처리합니다.
 *
 * 이 함수는 하위 호환성을 위해 유지되며, 필요시 추가 라우트를 등록할 수 있습니다.
 */
export function registerOAuthRoutes(app: Express) {
  // Clerk은 자체적으로 인증을 처리하므로 별도의 OAuth 콜백이 필요 없습니다.
  // 이 라우트는 이전 Manus OAuth에서 Clerk으로 마이그레이션 중인 사용자를 위해
  // 안내 메시지를 제공합니다.
  app.get("/api/oauth/callback", async (_req: Request, res: Response) => {
    res.status(410).json({
      message: "OAuth 콜백은 더 이상 사용되지 않습니다. Clerk 인증을 사용해주세요.",
      redirect: "/",
    });
  });

  // 로그아웃 엔드포인트 (필요시)
  app.post("/api/auth/logout", async (_req: Request, res: Response) => {
    // Clerk은 클라이언트 측에서 로그아웃을 처리합니다.
    // 서버 측에서는 추가적인 세션 정리가 필요한 경우에만 사용합니다.
    res.json({ success: true, message: "로그아웃 완료" });
  });
}
