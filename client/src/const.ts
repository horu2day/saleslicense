export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Clerk 인증 사용 - 로그인 URL은 Clerk이 자동으로 처리합니다
// 아래 함수는 하위 호환성을 위해 남겨둠 (사용되지 않음)
export const getLoginUrl = () => {
  console.warn("[Auth] getLoginUrl은 더 이상 사용되지 않습니다. Clerk을 사용하세요.");
  return "#";
};
