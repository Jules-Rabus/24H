import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-sync-scripts": "warn",
      "@next/next/no-before-interactive-script-outside-document": "warn",
      "react/react-in-jsx-scope": "off",
    },
  },
];

export default eslintConfig;
