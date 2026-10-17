import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/**
 * Suscripción a la media query del breakpoint mobile. `useSyncExternalStore`
 * lee el valor actual en el render (sin `setState` dentro de un effect), así
 * que no hay renders en cascada ni un primer frame con el valor equivocado.
 */
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches
}

/** En el servidor no hay viewport: se asume desktop y se corrige al hidratar. */
function getServerSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
