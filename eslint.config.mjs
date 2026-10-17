import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

/**
 * Lint del paquete publicado (`data-table/src`). El playground `base/` tiene su
 * propio config de Next.js y se lintea desde su carpeta (ver CI): el lint del
 * paquete es el que tiene que bloquear un release.
 */
export default tseslint.config(
  {
    ignores: ["data-table/dist/**", "base/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["data-table/src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs["recommended-latest"].rules,
      // Las reglas nuevas del compiler son error; `exhaustive-deps` queda como
      // warning para no bloquear por deuda preexistente.
      "react-hooks/exhaustive-deps": "warn",
    },
  }
)
