import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  // , "plugin:prettier/recommended"
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
  // Add this new config object with your rules
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      /* Prettier Integration */
      // "prettier/prettier": "error",

      /* TypeScript Specific */
      // "@typescript-eslint/no-unused-vars": [
      //   "",
      //   {
      //     argsIgnorePattern: "^_",
      //     varsIgnorePattern: "^_",
      //     caughtErrorsIgnorePattern: "^_",
      //   },
      // ],
      "@typescript-eslint/no-unused-vars": "off",
      // "@typescript-eslint/no-unused-vars": [
      //   "warn",
      //   {
      //     argsIgnorePattern: "^_",
      //     varsIgnorePattern: "^_",
      //     caughtErrorsIgnorePattern: "^_",
      //   },
      // ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@/prefer-const": "error",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports",
        },
      ],

      /* General Code Quality */
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  // Test file overrides
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];

export default eslintConfig;
