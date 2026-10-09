"use client"

import * as React from "react"

/** Cómo se navega a un `href` declarado en un DTO (detalle, edición o fila). */
export type NavigateFn = (href: string) => void

function defaultNavigate(href: string) {
  window.location.assign(href)
}

const NavigateContext = React.createContext<NavigateFn | null>(null)

/**
 * Puente de navegación del paquete: los componentes no dependen de ningún
 * router. Envuelve la app (o la parte que usa el data-table) con el `navigate`
 * del router que corresponda:
 *
 * - Next:      `const router = useRouter()` → `<EntityNavigateProvider navigate={router.push} />`
 * - React Router: `const navigate = useNavigate()` → `<EntityNavigateProvider navigate={navigate} />`
 *
 * Sin provider, un `href` se resuelve con `window.location.assign` (navegación
 * completa del documento).
 */
export function EntityNavigateProvider({
  navigate,
  children,
}: {
  navigate?: NavigateFn
  children: React.ReactNode
}) {
  return (
    <NavigateContext.Provider value={navigate ?? null}>
      {children}
    </NavigateContext.Provider>
  )
}

export function useEntityNavigate(): NavigateFn {
  return React.useContext(NavigateContext) ?? defaultNavigate
}
