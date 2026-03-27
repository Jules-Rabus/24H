/**
 * Hey API generated client setup.
 *
 * Import `apiClient` from this file to use the typed SDK.
 * The generated SDK files live in `src/api/generated/` — regenerate with:
 *   npm run generate-api
 */
import { client } from "./generated/client.gen"

client.setConfig({
  baseURL: process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost",
  auth: () =>
    typeof window !== "undefined"
      ? (localStorage.getItem("token") ?? undefined)
      : undefined,
})

export { client }
