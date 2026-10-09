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
import {
  DataTable,
  defineEntity,
  defineEntitySchema,
  defineTableDTO,
  EntityViewProvider,
} from "@mmanto/devbout-ui"

// Una sola declaración por entidad: el schema (JSON puro) más la glue.
const clientEntity = defineEntity<Client>({
  schema: defineEntitySchema({
    fields: [
      {
        kind: "text",
        name: "name",
        label: "Nombre",
        required: true,
        rules: { maxLength: 80 },
      },
      { kind: "date", name: "since", label: "Cliente desde" },
      // Derivado por el `build`: se ve en el detalle, no se edita.
      { kind: "text", name: "plan", label: "Plan", formHidden: true },
    ],
    labels: {
      createLabel: "Nuevo cliente",
      createTitle: "Nuevo cliente",
      createSubmit: "Crear cliente",
      editLabel: "Editar",
      editSubmit: "Guardar cambios",
      detailLabel: "Ver",
      cancel: "Cancelar",
      messages: { required: "Este campo es obligatorio" },
    },
  }),
  rowId: (row) => row.id,
  // `row` es `undefined` en un alta.
  build: (values, row) => ({
    id: row?.id ?? crypto.randomUUID(),
    name: values.name.trim(),
    since: values.since,
    plan: row?.plan ?? "free",
  }),
  create: { variant: "default" },
  edit: { title: (row) => `Editar ${row.name}` },
  detail: { title: (row) => row.name, description: "Detalle del cliente" },
})

const dto = defineTableDTO<Client>({
  entity: clientEntity,
  search: { columnId: "name", placeholder: "Buscar cliente…" },
  columns: [
    { id: "name", accessorKey: "name", header: "Cliente" },
    { id: "phone", accessorKey: "phone", header: "Teléfono" },
  ],
  rowActions: [
    { id: "delete", label: "Eliminar", variant: "destructive", run: async (row) => remove(row.id) },
  ],
})

<EntityViewProvider locale="es-AR">
  <DataTable dto={dto} data={clients} />
</EntityViewProvider>
```

`create`, `edit` y `detail` salen del **mismo schema**: `EntityViewProvider` decide
la superficie (preferencia global) y cada modo puede forzarla con `view` (`modal`,
`drawer` o `page`), con `TableDTO.view` como default de la tabla. En `page` la vista
ocupa el área en lugar de la grilla. El botón de alta, las acciones de fila y el
cuerpo del detalle se derivan solos; un detalle con forma propia se declara con
`detail.surface` (escape hatch), y `detail.sections` reparte los campos en bloques.

El alta/edición acepta dos caminos: `build` (arma la fila en memoria; la tabla la
inserta/actualiza con `ctx`) para tablas locales, u `onSubmit` (async) para tablas
contra la API. Con `onSubmit` el form no toca las filas: espera la promesa, muestra
el error si falla y cierra si sale bien — el dueño refresca (o setea la lista con
`onDataChange`).

La validación vive en el paquete (sin dependencias): `required`, `minLength`,
`maxLength`, `pattern`, `min` y `max` salen de las `rules` del campo, y
`entity.validate(values)` agrega reglas propias. El error se muestra bajo el campo
(el resumen queda en el cuerpo del formulario) y el envío queda bloqueado. Los
textos caen a un default en inglés del paquete y se traducen desde `schema.labels`;
`EntityViewProvider` acepta `locale`, `dateFormat` y `numberFormat` para el detalle.

Una pantalla propia puede reusar el formulario: `useEntityForm(entity, row)` da el
estado y `EntityForm` / `EntityFormFooter` la presentación (es lo que usan
`CreateEntity` / `EditEntity` por dentro, con un slot `header` para un resumen en
vivo).

La API completa (tipos `TableDTO`, `EntityDTO`, `EntityModeDTO`, `EntitySchema`,
`FieldDTO`, `FieldRules`, `FieldView`, `DetailSection`, `EntityLabels`,
`EntityMessages`, `RowActionDTO`, `BulkActionDTO`, `ConfirmDTO`, `TableLabels`;
helpers `defineEntitySchema`, `defineEntity`, `defineTableDTO`, `validateField`,
`validateSchema`, `initialValues`, `toFieldValues`, `resolveEntityText`;
componentes `EntityForm`, `EntityFormFooter`, `CreateEntity`, `EditEntity`,
`DetailEntity`, `useEntityForm`, `useEntityFormat`) está exportada y tipada;
`TableLabels` y `EntityLabels` concentran los textos para que la app los traduzca a
su idioma.

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
  usando **trusted publishing (OIDC)**: no hay `NPM_TOKEN`. Requiere, una sola vez,
  configurar el paquete en npmjs.com → Packages → `devbout-ui` → Settings →
  **Trusted publishing** → GitHub Actions con `Organization or user: mmanto`,
  `Repository: devbout-ui`, `Workflow filename: release.yml` y **tildar
  `npm publish`** entre las *allowed actions* (las configuraciones creadas desde
  set-2026 sólo permiten `npm stage publish` por defecto, y sin ese tilde el
  workflow queda en staging esperando aprobación manual con 2FA).
  El workflow corre en Node 24 porque trusted publishing exige npm ≥ 11.5.1.
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
