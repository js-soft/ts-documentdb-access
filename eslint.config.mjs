// @ts-check

import { configs } from "@js-soft/eslint-config-ts";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default tseslint.config(globalIgnores(["**/dist", "**/node_modules"]), {
    extends: [configs.base, configs.jest],
    languageOptions: {
        parserOptions: {
            project: ["./tsconfig.eslint.json", "./packages/*/tsconfig.json", "./packages/*/test/tsconfig.json"]
        }
    },
    files: ["**/*.ts"],
    rules: {
        "jest/max-nested-describe": ["error", { max: 3 }]
    }
});
