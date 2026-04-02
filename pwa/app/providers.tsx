"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { ZodError } from "zod";
import { Provider as ChakraProvider } from "../components/ui/provider";
import { Toaster, toaster } from "../components/ui/toaster";
import "../src/api/sdk-client"; // initialise le client hey-api (baseURL + JWT)

function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    const details = error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return `Validation: ${details}`;
  }
  if (error instanceof Error) return error.message;
  return "Une erreur est survenue";
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            console.error("[query] error:", error);
            toaster.create({
              title: "Erreur de chargement",
              description: formatError(error),
              type: "error",
              closable: true,
            });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error) => {
              if (error instanceof ZodError) return false;
              const status = (
                error as { response?: { status?: number } }
              )?.response?.status;
              if (status === 401) return false;
              return failureCount < 3;
            },
          },
          mutations: {
            onError: (error: unknown) => {
              console.error("[mutation] error:", error);
              toaster.create({
                title: "Erreur",
                description: formatError(error),
                type: "error",
                closable: true,
              });
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        {children}
        <Toaster />
      </ChakraProvider>
    </QueryClientProvider>
  );
}
