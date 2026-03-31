import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

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
        "sidebar.bg": {
          value: { _light: "{colors.gray.50}", _dark: "{colors.gray.900}" },
        },
        "sidebar.active": {
          value: {
            _light: "{colors.primary.50}",
            _dark: "{colors.primary.900}",
          },
        },
        "sidebar.activeBorder": { value: "{colors.primary.500}" },
        "card.bg": {
          value: { _light: "white", _dark: "{colors.gray.800}" },
        },
        "card.border": {
          value: { _light: "{colors.gray.200}", _dark: "{colors.gray.700}" },
        },
        "stat.green": {
          value: { _light: "#16a34a", _dark: "#4ade80" },
        },
        "stat.orange": {
          value: { _light: "#ea580c", _dark: "#fb923c" },
        },
        "stat.red": {
          value: { _light: "#dc2626", _dark: "#f87171" },
        },
        "stat.blue": {
          value: { _light: "#2563eb", _dark: "#60a5fa" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
