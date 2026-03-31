/**
 * Initialise le client hey-api avec la baseURL et les cookies HttpOnly.
 * Le token JWT est envoyé automatiquement via le cookie BEARER.
 */
import { client } from "./generated/client.gen";

client.setConfig({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost",
  throwOnError: true,
  withCredentials: true,
});

// On 401 (e.g. JWT key changed after redeploy), clear cookie and redirect
let isLoggingOut = false;
client.instance.interceptors.response.use(undefined, async (error) => {
  const url = error?.config?.url ?? "";
  const isAuthRoute = url.includes("/auth") || url.includes("/logout");
  if (
    error?.response?.status === 401 &&
    !isAuthRoute &&
    !isLoggingOut &&
    typeof window !== "undefined"
  ) {
    isLoggingOut = true;
    await client.instance
      .post(
        `${process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost"}/logout`,
      )
      .catch(() => {});
    window.location.href = "/login";
  }
  return Promise.reject(error);
});

export { client };
