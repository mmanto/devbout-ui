---
"@mmanto/devbout-ui": minor
---

Kit completo de primitivas + API de columnas re-exportada.

- Se suman las primitivas que faltaban: `avatar`, `badge`, `breadcrumb`,
  `collapsible`, `progress`, `skeleton`, `sidebar` (con `useSidebar`), `tooltip`
  y el hook `useIsMobile`. Con esto el paquete cubre el shell y el data-table que
  necesita `devbout-ui/base`, que ya lo consume en lugar de sus copias locales.
- Se re-exportan `createColumnHelper`, `ColumnDef` y `RowData` de
  `@tanstack/react-table`: el consumidor escribe sus DTOs sin instalar TanStack y
  queda una sola instancia de `@tanstack/table-core` en la app (dos copias dan
  tipos nominalmente incompatibles).
