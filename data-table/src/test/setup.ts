import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"

/**
 * jsdom no implementa `matchMedia` ni `ResizeObserver`, y las primitivas
 * base-mira (`Sidebar`, `Select`, …) y `useIsMobile` los consultan. Stubs
 * mínimos para que los tests corran sin navegador.
 */
if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

Element.prototype.scrollIntoView = () => {}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})
