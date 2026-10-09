---
"@mmanto/devbout-ui": minor
---

Formulario de entidad declarativo: **una sola declaración por entidad**.

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
