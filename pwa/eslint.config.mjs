import nextConfig from "eslint-config-next";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
    {
        ignores: [
            ".next/**",
            "node_modules/**",
            "src/api/generated/**",
            "public/mockServiceWorker.js",
        ],
    },
    ...nextConfig,
    {
        files: [
            "components/classement/BibDownloadButton.tsx",
            "components/classement/BulkBibDownloadButton.tsx",
            "components/entities/users.tsx",
        ],
        rules: {
            "jsx-a11y/alt-text": "off",
        },
    },
    eslintConfigPrettier,
];

export default eslintConfig;
