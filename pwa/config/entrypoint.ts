export const ENTRYPOINT = typeof window === "undefined" ? process.env.NEXT_PUBLIC_ENTRYPOINT : window.origin;
export const API_AUTH_PATH = `${ENTRYPOINT}/login`;
