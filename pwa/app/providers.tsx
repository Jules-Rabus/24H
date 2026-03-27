"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Provider as ChakraProvider } from "../components/ui/provider";
import { Toaster, toaster } from "../components/ui/toaster";
import "../src/api/sdk-client"; // initialise le client hey-api (baseURL + JWT)

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 3,
          },
          mutations: {
            onError: (error: unknown) => {
              console.error("[mutation] error:", error);
              const message =
                error instanceof Error
                  ? error.message
                  : "Une erreur est survenue";
              toaster.create({
                title: "Erreur",
                description: message,
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
