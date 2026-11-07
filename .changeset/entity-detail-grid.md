---
"@mmanto/devbout-ui": patch
---

El detalle de entidad (`DetailEntity`) usa la rejilla canónica de 1/2/3
columnas. Antes el `@container` estaba en el mismo `<dl>` que las variantes
`@md`, así que la consulta no aplicaba y los campos quedaban en una sola
columna. Los `textarea` (y los campos con `view.span: 2`) ocupan 2 columnas, o
las 3 cuando quedan solos en su fila.
