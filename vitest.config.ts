import react from "@vitejs/plugin-react"
import { defineConfig } from "vitest/config"

/**
 * Tests del paquete corridos desde la raíz del workspace: acá viven las
 * devDependencies de testing y Vitest resuelve un único `node_modules`.
 *
 * Los tests importan `data-table/src` directamente (no `dist/`), así que no
 * hace falta build previo para correrlos. El entorno es jsdom + Testing Library:
 * sin navegador, apto para CI.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./data-table/src/test/setup.ts"],
    include: ["data-table/src/**/*.test.{ts,tsx}"],
    clearMocks: true,
    restoreMocks: true,
  },
})
