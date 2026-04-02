import { describe, it, expect, vi, beforeEach } from "vitest";
import { make401Interceptor } from "../auth-interceptor";

const BASE_URL = "http://localhost";

// Reset module-level isLoggingOut between tests by reimporting
beforeEach(() => {
  vi.resetModules();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));
  vi.stubGlobal("window", { location: { href: "" } });
});

function makeError(status: number, url: string) {
  return {
    response: { status },
    config: { url },
  };
}

describe("make401Interceptor", () => {
  it("calls /logout and redirects on 401 from a non-auth route", async () => {
    const { make401Interceptor } = await import("../auth-interceptor");
    const handler = make401Interceptor(BASE_URL);

    await expect(
      handler(makeError(401, "/users/public")),
    ).rejects.toBeDefined();

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}/logout`,
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
    expect(window.location.href).toBe("/login");
  });

  it("does NOT redirect on 401 from /logout", async () => {
    const { make401Interceptor } = await import("../auth-interceptor");
    const handler = make401Interceptor(BASE_URL);

    await expect(handler(makeError(401, "/logout"))).rejects.toBeDefined();

    expect(fetch).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("does NOT redirect on 401 from /login", async () => {
    const { make401Interceptor } = await import("../auth-interceptor");
    const handler = make401Interceptor(BASE_URL);

    await expect(handler(makeError(401, "/login"))).rejects.toBeDefined();

    expect(fetch).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("does NOT redirect on 403", async () => {
    const { make401Interceptor } = await import("../auth-interceptor");
    const handler = make401Interceptor(BASE_URL);

    await expect(
      handler(makeError(403, "/users/public")),
    ).rejects.toBeDefined();

    expect(fetch).not.toHaveBeenCalled();
    expect(window.location.href).toBe("");
  });

  it("calls /logout only once when triggered concurrently", async () => {
    const { make401Interceptor } = await import("../auth-interceptor");
    const handler = make401Interceptor(BASE_URL);

    await Promise.allSettled([
      handler(makeError(401, "/users/public")),
      handler(makeError(401, "/participations")),
      handler(makeError(401, "/runs")),
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(window.location.href).toBe("/login");
  });

  it("does nothing outside browser (no window)", async () => {
    vi.stubGlobal("window", undefined);
    const { make401Interceptor } = await import("../auth-interceptor");
    const handler = make401Interceptor(BASE_URL);

    await expect(
      handler(makeError(401, "/users/public")),
    ).rejects.toBeDefined();

    expect(fetch).not.toHaveBeenCalled();
  });
});
