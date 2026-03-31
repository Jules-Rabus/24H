# PWA Test Architecture

Date: 2026-03-31

---

## Current State

### Tooling installed

- **Vitest** v4.1 — test runner (jsdom environment)
- **React Testing Library** v16 + `@testing-library/jest-dom` + `@testing-library/user-event`
- **MSW** v2 — API mocking (request handlers per domain)
- **Playwright** v1.58 — E2E tests (in `e2e/` at repo root)

### Existing tests

| File                                       | Type        | What it tests                  |
| ------------------------------------------ | ----------- | ------------------------------ |
| `src/__tests__/login.test.tsx`             | Integration | Login page form + auth flow    |
| `src/__tests__/forgot-password.test.tsx`   | Integration | Password reset flow            |
| `src/__tests__/upload.test.tsx`            | Integration | Media upload page              |
| `src/__tests__/public-race-status.test.tsx`| Integration | Public race status page        |
| `src/api/__tests__/api.test.ts`           | Unit        | API client configuration       |

### Existing MSW handlers

Organized per domain in `src/mocks/handlers/`:
- `auth.ts` — POST /auth, GET /me
- `runners.ts` — GET /users/public
- `race.ts` — GET /runs, GET /participations
- `media.ts` — POST /race_medias
- `weather.ts` — Open-Meteo API
- `index.ts` — re-exports all handlers

### Config

- `vitest.config.ts` — jsdom env, globals, alias `@` → `./src`, `~` → `./`
- `vitest.setup.ts` — imports jest-dom, starts MSW server, configures SDK client baseURL
- Include pattern: `src/**/*.{test,spec}.{ts,tsx}`

---

## Proposed Architecture

### 1. Unit Tests

**What to test:**
- Zod schemas (`src/state/*/schemas.ts`) — validate correct inputs, reject bad inputs
- `useDebounce` hook — debounces value updates correctly
- Utility functions (formatTime, etc. if extracted)
- Query key factories — ensure deterministic key generation

**Location:** `src/state/<domain>/__tests__/<file>.test.ts` for schemas, `src/hooks/__tests__/` for hooks

**Pattern:**
```ts
// src/state/admin/users/__tests__/schemas.test.ts
import { userFormSchema } from "../schemas";

describe("userFormSchema", () => {
  it("requires firstName", () => { ... });
  it("validates email format", () => { ... });
  it("accepts valid user data", () => { ... });
});
```

**Note:** No DOM needed, no MSW needed. Pure logic tests.

### 2. Component Tests

**What to test:**
- `DataTable` — renders columns, pagination, sorting, selection checkbox
- `StatCard` — renders label, value, icon, loading skeleton
- `ConfirmDialog` — open/close, calls onConfirm
- `PublicNav` — renders links, highlights active route
- `BibDownloadButton` — renders button (skip PDF generation in tests)

**Location:** Colocated as `components/<path>/__tests__/<Component>.test.tsx`

**Pattern:**
```tsx
// components/admin/ui/__tests__/DataTable.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../DataTable";

// Wrap with ChakraProvider for Chakra components
const wrapper = ({ children }) => <ChakraProvider>{children}</ChakraProvider>;

describe("DataTable", () => {
  it("renders column headers", () => { ... });
  it("calls onPageChange when clicking next", () => { ... });
  it("toggles row selection", () => { ... });
  it("shows skeleton rows when loading", () => { ... });
});
```

**Note:** Need a test wrapper with `ChakraProvider`. Create `src/test-utils.tsx`:
```tsx
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { system } from "~/components/ui/theme";

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

export function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
}
```

### 3. Integration Tests (Page-level)

**What to test:**
- Admin pages (users, runs, participations, medias) — renders data from API, CRUD operations
- Public pages (classement, coureurs/[id]) — renders runner list, stats

**Location:** `src/__tests__/<page-name>.test.tsx` (existing pattern)

**Pattern:**
```tsx
// src/__tests__/admin-users.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/admin/users",
}));

describe("AdminUsersPage", () => {
  it("renders user list from API", async () => { ... });
  it("opens create dialog on button click", async () => { ... });
  it("filters users with debounced search", async () => { ... });
  it("selects users and shows bulk dossard button", async () => { ... });
});
```

**New MSW handlers needed:**
- `src/mocks/handlers/admin-users.ts` — GET /users, GET /users/{id}, POST /users, PATCH /users/{id}, DELETE /users/{id}
- `src/mocks/handlers/admin-runs.ts` — GET /runs, GET /runs/{id}, POST /runs, PATCH /runs/{id}, DELETE /runs/{id}
- `src/mocks/handlers/admin-participations.ts` — GET /participations, POST /participations, PATCH /participations/{id}, DELETE /participations/{id}
- `src/mocks/handlers/admin-medias.ts` — GET /race_medias, DELETE /race_medias/{id}

### 4. E2E Tests (Playwright)

**Existing:** `e2e/tests/workflows/` at repo root

**What to add:**
- Admin login + CRUD flow for each resource
- Public classement browsing
- Runner profile viewing
- Dossard download (verify PDF generation triggers)

**Location:** `e2e/tests/workflows/`

---

## Vitest Config Changes

Update `vitest.config.ts` include pattern to also cover component tests:

```ts
include: [
  "src/**/*.{test,spec}.{ts,tsx}",
  "components/**/*.{test,spec}.{ts,tsx}",
],
```

Add `~` alias for `components/` imports.

---

## Priority Order

1. **Zod schema tests** — fast to write, high value, pure logic
2. **Test utils** — `TestProviders` wrapper needed for all component/integration tests
3. **DataTable + StatCard component tests** — most reused components
4. **Admin users page integration test** — most complex page, validates full flow
5. **Public classement integration test** — validates public API integration
6. **Remaining admin page tests** — runs, participations, medias
7. **New MSW handlers** — incrementally as pages are tested

---

## Best Practices

1. **One query client per test** — use `createTestQueryClient()` to avoid cache leaks
2. **`waitFor` for async** — always `await waitFor(() => expect(...))` for data loaded from API
3. **`userEvent` over `fireEvent`** — more realistic user interactions
4. **MSW `server.use()` for overrides** — test error states by overriding handlers per-test
5. **No snapshot tests** — brittle with Chakra's generated class names
6. **Mock `next/navigation`** — always mock `useRouter`, `usePathname`, `useParams`
7. **Skip PDF/canvas in tests** — mock `@react-pdf/renderer` and `@bwip-js/browser` at module level
8. **Test behavior, not implementation** — query by role/text, not by class/data-testid
