export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Login URL now points to the Supabase sign-in page
export const getLoginUrl = (returnPath?: string) => {
  const base = "/sign-in";
  if (returnPath && returnPath !== "/") {
    return `${base}?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return base;
};
