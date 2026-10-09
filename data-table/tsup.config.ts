import { defineConfig } from "tsup"

/**
 * Build del paquete: un bundle ESM + uno CJS con tipos, sin JSX compilado por el
 * consumidor (`node_modules` no se transpila fuera de un monorepo).
 *
 * El `"use client"` no se puede emitir con `banner` (esbuild descarta las
 * directivas de módulo al bundelear): lo agrega `scripts/use-client.mjs` sobre
 * el bundle ya emitido.
 */
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ["react", "react-dom"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".js" }
  },
})
