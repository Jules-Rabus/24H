import "@testing-library/jest-dom"
import { beforeAll, afterEach, afterAll } from "vitest"
import { server } from "./src/mocks/server"
import { client } from "./src/api/generated/client.gen"

// Point the SDK client to the test base URL (intercepted by MSW)
client.setConfig({
  baseURL: "http://localhost",
  throwOnError: true,
})

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
