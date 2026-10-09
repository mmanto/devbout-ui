# @mmanto/devbout-ui

Primitivas de UI estilo **base-mira** (shadcn sobre [Base UI](https://base-ui.com)) y un
**data-table declarativo**: tabla con orden/filtros/visibilidad de columnas, selección
múltiple, acciones por fila, y alta/edición/detalle resueltos por un DTO.

Extraído de `devbout-ui/base` (el playground Next vive en la raíz de este repo) para
poder reusarlo desde varias apps manteniendo versiones.

## Instalación

```bash
npm install @mmanto/devbout-ui
```

Requiere **React 19** y **Tailwind CSS 4** (CSS-first) en la app consumidora.

Los pares de runtime (`@base-ui/react`, `@hugeicons/*`, `@tanstack/react-table`,
`class-variance-authority`, `clsx`, `tailwind-merge`) vienen como dependencias del
paquete; React y React DOM son `peerDependencies` para no duplicar la copia.

## Contrato de CSS del consumidor

El paquete **no** trae CSS compilado: expone clases Tailwind y las escanea el Tailwind de
la app. En el CSS de la app:

```css
@import "tailwindcss";
@import "tw-animate-css";        /* animate-in / animate-out de las primitivas */
@import "shadcn/tailwind.css";   /* @custom-variant data-open / data-closed /
                                    data-ending-style / data-starting-style + keyframes */
@import "@mmanto/devbout-ui/tailwind.css";  /* hace @source sobre el paquete */

@custom-variant dark (&:is(.dark *));

:root { /* …tokens base-mira, ver abajo… */ }
.dark { /* …contraparte oscura… */ }
```

`@import "@mmanto/devbout-ui/tailwind.css"` equivale a un
`@source "../node_modules/@mmanto/devbout-ui/dist";` (Tailwind v4 ignora `node_modules`
salvo que se lo pida explícitamente). Las otras dos importaciones son las que usan las
primitivas base-mira; `tw-animate-css` y `shadcn` son paquetes públicos.

Además hace falta esta regla base: en Tailwind v4 el color de borde por defecto es
`currentColor`, así que **todo** `border` sin color explícito (los usan las filas de la
tabla, diálogos y sheets) saldría del color del texto:

```css
@layer base {
  * {
    border-color: var(--border);
  }
}
```

### Tokens requeridos

Los componentes sólo usan tokens semánticos. La app debe definir, en `:root` (y su
contraparte en `.dark`):

```
--background --foreground --card --card-foreground --popover --popover-foreground
--primary --primary-foreground --secondary --secondary-foreground
--muted --muted-foreground --accent --accent-foreground
--destructive --success --warning --info
--border --input --ring --radius
```

Ejemplo mínimo (formato oklch, copiable):

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --success: oklch(0.58 0.13 152);
  --warning: oklch(0.64 0.14 72);
  --info: oklch(0.56 0.15 250);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}
```

Y en el `@theme inline` de la app, el mapeo a utilidades:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* …un `--color-<token>: var(--<token>)` por cada token de la lista… */
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
```

## Navegación

El data-table no depende de ningún router: cuando un DTO declara `href`, usa el
`navigate` inyectado. Envolvé la app (una vez):

```tsx
// Next (App Router)
const router = useRouter()
<EntityNavigateProvider navigate={(href) => router.push(href)}>{children}</EntityNavigateProvider>

// React Router
const navigate = useNavigate()
<EntityNavigateProvider navigate={navigate}>{children}</EntityNavigateProvider>
```

Sin provider, un `href` cae a `window.location.assign`.

## Uso

```tsx
import { DataTable, defineTableDTO, EntityViewProvider } from "@mmanto/devbout-ui"

const dto = defineTableDTO<Client>({
  labels: { empty: "Sin clientes", search: "Buscar cliente…" },
  columns: [
    { id: "name", header: "Cliente", cell: (row) => row.name },
    { id: "phone", header: "Teléfono", cell: (row) => row.phone },
  ],
  detail: { label: "Ver", fields: [{ id: "notes", label: "Notas", value: (row) => row.notes }] },
  edit: {
    label: "Editar",
    fields: [{ id: "name", label: "Cliente", required: true }],
    onSubmit: async (values, row) => { await save(row.id, values) },
  },
  rowActions: [
    { id: "delete", label: "Eliminar", variant: "destructive", run: async (row) => remove(row.id) },
  ],
})

<EntityViewProvider>
  <DataTable dto={dto} data={clients} />
</EntityViewProvider>
```

`EntityViewProvider` decide si el detalle/edición se abre en **modal**, **drawer** (por
defecto) o **página completa** (`useEntityViewMode()`).

La API completa (tipos `TableDTO`, `FieldDTO`, `DetailDTO`, `EditDTO`, `RowActionDTO`,
`BulkActionDTO`, `ConfirmDTO`, `TableLabels`, `defineTableDTO`) está exportada y
tipada; `TableLabels` concentra los textos para que la app los traduzca a su idioma.

## Versionado

- Semver. Mientras esté en `0.x`, un cambio incompatible sube la **minor**.
- Cada cambio entra con un `changeset`:

  ```bash
  npm run changeset        # describe el cambio (patch/minor/major)
  npm run version-packages # sube versiones + CHANGELOG
  npm run release          # build + publish
  ```

- Prerelease para probar en una app antes de publicar:

  ```bash
  npx changeset pre enter canary && npm run version-packages
  npm run release -- --tag canary   # instalar con: @mmanto/devbout-ui@canary
  ```

- El workflow `.github/workflows/release.yml` publica al mergear el PR de versiones
  (necesita el secret `NPM_TOKEN` con permiso de publish sobre el scope `@mmanto`).
- Para iterar sin publicar: `npm pack` + `npm i ./mmanto-devbout-ui-x.y.z.tgz` en la app.

## Desarrollo

```bash
npm install          # raíz del repo (workspaces)
npm run typecheck
npm run build        # tsup → dist/index.js + dist/index.cjs + dist/index.d.ts
```

El playground visual es `base/` (Next 16 + Tailwind 4), que todavía tiene su copia local
de estos componentes: migrarlo a consumir `@mmanto/devbout-ui` es el paso de dogfooding
pendiente.
