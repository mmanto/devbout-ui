---
"@mmanto/devbout-ui": patch
---

`formatDate` del detalle de entidad acepta timestamps ISO (`2026-03-01T14:30:00Z`,
`+00:00`) además de fechas civiles (`2026-03-01`). Antes, un campo `date` con un
timestamp ISO se mostraba crudo. Las fechas civiles siguen formateándose sin
corrimiento por zona horaria; los timestamps se formatean en la zona del runtime.
