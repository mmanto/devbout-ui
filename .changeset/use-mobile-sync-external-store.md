---
"@mmanto/devbout-ui": patch
---

`useIsMobile` ahora lee la media query con `useSyncExternalStore` en lugar de
hacer `setState` dentro de un `useEffect`. Mismo comportamiento (incluye
`false` en el servidor y el valor real al hidratar), sin renders en cascada: era
el patrón que marcaba el lint de React Hooks (`react-hooks/set-state-in-effect`).
