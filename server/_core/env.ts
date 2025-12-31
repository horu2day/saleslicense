export const ENV = {
  // Clerk 인증 설정
  clerkPublishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY ?? "",
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",

  // 데이터베이스
  databaseUrl: process.env.DATABASE_URL ?? "",

  // 환경 설정
  isProduction: process.env.NODE_ENV === "production",

  // Forge API (선택사항)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // (구) Manus OAuth - 더 이상 사용하지 않음
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
};
