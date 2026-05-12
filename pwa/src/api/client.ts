import axios from "axios";
import { make401Interceptor } from "./auth-interceptor";

// In mock mode, force a same-origin baseURL so requests stay on the Next dev
// origin (where the MSW service worker is registered). Otherwise axios would
// hit `https://localhost` (Caddy), which has no service worker scope and would
// bypass all handlers.
const isMock = process.env.NEXT_PUBLIC_API_MOCK === "1";
const baseURL = isMock
  ? ""
  : (process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost");

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: !isMock,
});

apiClient.interceptors.response.use(undefined, make401Interceptor(baseURL));
