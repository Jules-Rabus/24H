import axios from "axios";
import { make401Interceptor } from "./auth-interceptor";

const baseURL = process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost";

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.response.use(undefined, make401Interceptor(baseURL));
