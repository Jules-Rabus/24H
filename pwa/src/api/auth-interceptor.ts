/**
 * Shared 401 handler: on JWT invalidation (e.g. redeploy with new keypair),
 * clears the cookie via /logout then redirects to /login.
 *
 * Single isLoggingOut flag shared across both axios clients (apiClient + sdk client)
 * to avoid double-redirect when multiple concurrent requests fail with 401.
 */

let isLoggingOut = false;

export function make401Interceptor(baseURL: string) {
  return async (error: unknown) => {
    const axiosError = error as {
      response?: { status?: number };
      config?: { url?: string; _skipAuthInterceptor?: boolean };
    };

    const status = axiosError?.response?.status;
    const url = axiosError?.config?.url ?? "";
    const skip = axiosError?.config?._skipAuthInterceptor;

    const isAuthRoute =
      url.includes("/auth") ||
      url.includes("/logout") ||
      url.includes("/login");

    if (
      status === 401 &&
      !isAuthRoute &&
      !skip &&
      !isLoggingOut &&
      typeof window !== "undefined"
    ) {
      isLoggingOut = true;
      // Call /logout without credentials to avoid re-triggering 401 on an invalid token.
      // We don't care if it fails — the goal is just to clear the server-side cookie.
      await fetch(`${baseURL}/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
      window.location.href = "/login";
    }

    return Promise.reject(error);
  };
}
