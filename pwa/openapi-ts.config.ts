import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: process.env.OPENAPI_INPUT ?? "./openapi.json",
  output: {
    path: "src/api/generated",
    postProcess: ["prettier"],
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
