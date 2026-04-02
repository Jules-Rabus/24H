import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules/**", "node_modulese/**", "e2e/**", ".next/**"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    alias: {
      "@/components": path.resolve(__dirname, "./components"),
      "@": path.resolve(__dirname, "./src"),
      "~": path.resolve(__dirname, "./"),
    },
  },
});
