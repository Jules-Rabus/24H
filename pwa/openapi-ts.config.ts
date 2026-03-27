import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: `${process.env.NEXT_PUBLIC_ENTRYPOINT ?? "http://localhost"}/api/docs.json`,
  output: {
    path: "src/api/generated",
    format: "prettier",
  },
  plugins: [
    "@hey-api/typescript",
    "zod",
    {
      name: "@hey-api/sdk",
      validator: {
        response: "zod",
      },
    },
    {
      name: "@hey-api/client-axios",
    },
  ],
})
