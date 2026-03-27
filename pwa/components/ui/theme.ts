import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: "#e6f6f7" },
          100: { value: "#b3e4e7" },
          200: { value: "#80d2d7" },
          300: { value: "#4dbfc7" },
          400: { value: "#26b1bb" },
          500: { value: "#0f929a" },
          600: { value: "#0c7a81" },
          700: { value: "#096168" },
          800: { value: "#06494f" },
          900: { value: "#033035" },
        },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          solid: { value: "{colors.primary.500}" },
          contrast: { value: "white" },
          fg: { value: "{colors.primary.600}" },
          muted: { value: "{colors.primary.100}" },
          subtle: { value: "{colors.primary.200}" },
          emphasized: { value: "{colors.primary.300}" },
          focusRing: { value: "{colors.primary.500}" },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
