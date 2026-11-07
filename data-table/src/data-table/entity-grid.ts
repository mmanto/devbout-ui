/**
 * Rejilla canónica de las entity views (forms y detalle): 1 columna, 2 cuando
 * el contenedor llega a 28rem (`@md`) y 3 cuando llega a 42rem (`@2xl`).
 * Ver docs/design/DESIGN.md §9.1.
 *
 * El elemento que lleva estas clases tiene que estar dentro de un
 * `@container` (el contenedor de las consultas no puede ser el mismo elemento
 * que las usa).
 */
export const ENTITY_GRID_CLASSES =
  "grid gap-4 @md:grid-cols-2 @2xl:grid-cols-3"

/** Campo multilínea: 2 columnas en las rejillas de 2 y de 3. */
const SPAN_WIDE = "@md:col-span-2 @2xl:col-span-2"
/** Campo multilínea solo en su fila: las 3 columnas de la rejilla ancha. */
const SPAN_WIDE_FULL = "@md:col-span-2 @2xl:col-span-3"

/**
 * Reparte los campos de la rejilla de 3 columnas y devuelve la clase de ancho
 * de cada uno, en orden. Los multilínea ocupan 2 columnas; pasan a 3 cuando
 * arrancarían una fila y el campo siguiente también es multilínea (o no hay
 * siguiente), así no queda un hueco de una columna al lado.
 */
export function fieldSpans(wide: readonly boolean[]): string[] {
  const spans: string[] = []
  // Columnas ocupadas en la fila actual de la rejilla ancha (0, 1 o 2).
  let column = 0

  for (let index = 0; index < wide.length; index += 1) {
    if (!wide[index]) {
      spans.push("")
      column = (column + 1) % 3
      continue
    }

    // Un campo de 2 columnas no entra si sólo queda una libre: arranca la
    // fila siguiente, donde se reevalúa el ancho.
    if (column === 2) column = 0

    const full = column === 0 && wide[index + 1] !== false
    spans.push(full ? SPAN_WIDE_FULL : SPAN_WIDE)
    column = (column + (full ? 3 : 2)) % 3
  }

  return spans
}