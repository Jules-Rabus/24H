/**
 * Double-submit cookie CSRF helper.
 *
 * Calls GET /csrf-token once, which sets a XSRF-TOKEN cookie.
 * Returns the token value to be sent as X-XSRF-TOKEN header.
 * Caches the token in memory — re-fetches only if stale or missing.
 */

let cachedToken: string | null = null;

const baseURL = process.env.NEXT_PUBLIC_ENTRYPOINT ?? "";

export async function getCsrfToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const res = await fetch(`${baseURL}/csrf-token`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch CSRF token");
  }

  const { token } = (await res.json()) as { token: string };
  cachedToken = token;
  return token;
}

export function clearCsrfToken(): void {
  cachedToken = null;
}
