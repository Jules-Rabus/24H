import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// On 401 (e.g. JWT key changed after redeploy), clear cookie and redirect
let isLoggingOut = false;
apiClient.interceptors.response.use(undefined, async (error) => {
  const url = error?.config?.url ?? "";
  const isAuthRoute = url.includes("/auth") || url.includes("/logout");
  if (
    error?.response?.status === 401 &&
    !isAuthRoute &&
    !isLoggingOut &&
    typeof window !== "undefined"
  ) {
    isLoggingOut = true;
    await apiClient.post("/logout").catch(() => {});
    window.location.href = "/login";
  }
  return Promise.reject(error);
});
