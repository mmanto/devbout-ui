import { readFileSync, writeFileSync } from "node:fs"

/**
 * esbuild descarta las directivas de módulo al bundelear, así que el
 * `"use client"` se agrega acá una sola vez sobre el bundle ya emitido: los
 * consumidores con React Server Components (Next) tratan todo el paquete como
 * módulo cliente.
 */
const DIRECTIVE = '"use client";\n'

for (const file of ["dist/index.js", "dist/index.cjs"]) {
  const source = readFileSync(file, "utf8")
  if (source.startsWith('"use client"')) continue
  writeFileSync(file, DIRECTIVE + source)
}
