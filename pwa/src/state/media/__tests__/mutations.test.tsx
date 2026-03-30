import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUploadRaceMediaMutation } from "../mutations";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";
import { mockRaceMediaResponse, mockRaceMediaWithoutCommentResponse } from "./data";
import { client } from "@/api/generated/client.gen";

describe("useUploadRaceMediaMutation", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it("calls the API with correct body and invalidates queries on success", async () => {
    let capturedRequest: Request | null = null;
    server.use(
      http.post("http://localhost/race_medias", async ({ request }) => {
        capturedRequest = request.clone();
        return HttpResponse.json(mockRaceMediaResponse);
      })
    );

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUploadRaceMediaMutation(), { wrapper });

    const formData = new FormData();
    const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
    formData.append("file", mockFile);
    formData.append("comment", "Test comment");

    let mutationResult;
    await waitFor(async () => {
      mutationResult = await result.current.mutateAsync(formData);
    });

    expect(capturedRequest).toBeDefined();

    expect(capturedRequest?.method).toBe("POST");

    expect(mutationResult).toBeDefined();

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["race"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "medias"] });
  });

  it("calls the API without comment if none is provided", async () => {
    server.use(
      http.post("http://localhost/race_medias", () => {
        return HttpResponse.json(mockRaceMediaWithoutCommentResponse);
      })
    );

    const { result } = renderHook(() => useUploadRaceMediaMutation(), { wrapper });

    const formData = new FormData();
    const mockFile = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
    formData.append("file", mockFile);

    let mutationResult;
    await waitFor(async () => {
      mutationResult = await result.current.mutateAsync(formData);
    });

    expect(mutationResult).toBeDefined();
  });

  it("fails if API call fails", async () => {
    server.use(
      http.post("http://localhost/race_medias", () => {
        return new HttpResponse(null, { status: 500, statusText: "API ERROR" });
      })
    );

    const { result } = renderHook(() => useUploadRaceMediaMutation(), { wrapper });

    const formData = new FormData();
    formData.append("file", new File(["test"], "test.jpg", { type: "image/jpeg" }));

    await expect(result.current.mutateAsync(formData)).rejects.toThrow();
  });
});
