# @mmanto/devbout-ui

## 0.3.0

### Minor Changes

- 748e756: Formulario de entidad declarativo: **una sola declaración por entidad**.

  - `EntitySchema` (campos + labels, JSON puro) y `defineEntity` reemplazan
    `CreateDTO` / `EditDTO` / `DetailDTO`. `TableDTO.entity` declara el alta, la
    edición y el detalle de una vez (adiós al array `fields` duplicado y a
    `detailSurface` / `rowId` en la tabla).
  - Validación en el paquete, sin dependencias: `required`, `minLength`,
    `maxLength`, `pattern`, `min`, `max` desde las `rules` del campo, más
    `entity.validate`. El mensaje sale debajo del campo y el envío queda bloqueado
    (el `<form>` es `noValidate`, así que el navegador no pisa el mensaje).
  - Detalle declarativo desde el mismo schema (por `kind`, con
    `SelectOption.variant` para pintar badges) y escape hatch `detail.surface` para
    un cuerpo propio; `detail.sections` reparte los campos en bloques.
  - `EntityViewProvider` acepta `locale`, `dateFormat` y `numberFormat`;
    `useEntityFormat` los expone al detalle. `EntityForm`, `EntityFormFooter` y
    `useEntityForm` quedan públicos para pantallas propias.

## 0.2.0

### Minor Changes

- Superficie configurable por acción y alta/edición contra la API.

  - `CreateDTO`, `EditDTO`, `DetailDTO` y `TableDTO` aceptan `view` (`modal` |
    `drawer` | `page`): cada acción fija su superficie y `TableDTO.view` es el
    default de la tabla. Sin `view` sigue mandando la preferencia global de
    `EntityViewProvider`. En `page` la vista toma el área en vez de la grilla.
  - `CreateDTO`/`EditDTO` suman `onSubmit` (async) como alternativa a `build`: el
    form espera la promesa, deshabilita el envío, muestra el error si falla y se
    cierra si sale bien. `build` pasa a ser opcional (sigue siendo el camino de las
    tablas locales, que la tabla resuelve con `ctx.add`/`ctx.update`).

- 42eaada: Kit completo de primitivas + API de columnas re-exportada.

  - Se suman las primitivas que faltaban: `avatar`, `badge`, `breadcrumb`,
    `collapsible`, `progress`, `skeleton`, `sidebar` (con `useSidebar`), `tooltip`
    y el hook `useIsMobile`. Con esto el paquete cubre el shell y el data-table que
    necesita `devbout-ui/base`, que ya lo consume en lugar de sus copias locales.
  - Se re-exportan `createColumnHelper`, `ColumnDef` y `RowData` de
    `@tanstack/react-table`: el consumidor escribe sus DTOs sin instalar TanStack y
    queda una sola instancia de `@tanstack/table-core` en la app (dos copias dan
    tipos nominalmente incompatibles).

### Patch Changes

- fefa563: Licencia **Apache-2.0**. La 0.1.0 quedó publicada como `UNLICENSED`: se agrega el archivo `LICENSE` (texto completo) al paquete y el campo `license` en los `package.json`.
