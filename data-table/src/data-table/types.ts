import type { ReactNode } from "react"
import type { ColumnDef, RowData } from "@tanstack/react-table"

import type { EntityViewMode } from "../entity-view"
import type { DataTableFeatures } from "./features"
import type {
  EntitySchema,
  EntityText,
  EntityTitle,
  FieldValues,
} from "./entity-schema"

export type {
  EntityLabels,
  EntityMessages,
  EntityText,
  EntityTitle,
  FieldDTO,
  FieldRules,
  FieldValues,
  FieldView,
  SelectOption,
} from "./entity-schema"

export type TableActionContext<TData> = {
  add: (row: TData) => void
  update: (row: TData, next: TData) => void
  remove: (rows: TData[]) => void
  clearSelection: () => void
}

export type RowActionDTO<TData> = {
  id: string
  label: string
  variant?: "default" | "destructive"
  run: (row: TData, ctx: TableActionContext<TData>) => void
}

export type BulkActionDTO<TData> = {
  id: string
  label: string
  variant?: "default" | "destructive"
  run: (rows: TData[], ctx: TableActionContext<TData>) => void
}

/** Sección de un detalle declarativo. */
export type DetailSection<TData> =
  | {
      kind: "fields"
      title?: string
      /** Nombres de campos del schema, en orden; default: todos los visibles. */
      fields?: readonly string[]
    }
  /** Escape hatch por bloque (métricas, tablas hijas, acciones). */
  | { kind: "custom"; render: (row: TData) => ReactNode }

/** Ajustes de una acción (crear / editar / ver). Todo cae a `schema.labels`. */
export type EntityModeDTO<TData> = {
  label?: string
  title?: EntityTitle<TData>
  description?: EntityText<TData>
  submitLabel?: string
  view?: EntityViewMode
}

/**
 * Declaración completa de una entidad: el schema serializable más la glue
 * mínima. De acá el paquete deriva las tres superficies (crear / editar / ver),
 * y la tabla saca sus acciones de fila y su botón de alta.
 */
export type EntityDTO<TData> = {
  /** Spec serializable — única declaración del formulario y su detalle. */
  schema: EntitySchema

  // ── glue (funciones; fuera del schema portable) ──────────────────────
  /** Identidad estable de fila. Requerido si la entidad tiene detalle/edición. */
  rowId?: (row: TData) => string
  /** Valores del form desde una fila. Default: `toFieldValues(schema.fields, row)`. */
  toValues?: (row: TData) => FieldValues
  /** Arma la entidad desde los valores; `row` es `undefined` cuando es un alta. */
  build?: (values: FieldValues, row: TData | undefined) => TData
  /** Alternativa contra la API a `build`: se espera, deshabilita el pie y muestra el error. */
  onSubmit?: (values: FieldValues, row: TData | undefined) => void | Promise<void>
  /** Validación extra; pisa el mensaje del schema para el mismo `name`. */
  validate?: (values: FieldValues) => Record<string, string> | null

  /** Superficie por defecto de los tres modos. */
  view?: EntityViewMode
  create?: EntityModeDTO<TData> & { variant?: "default" | "outline" }
  edit?: EntityModeDTO<TData> & { href?: (row: TData) => string }
  detail?: EntityModeDTO<TData> & {
    href?: (row: TData) => string
    closeLabel?: string
    /** Clases de la superficie, por modo (para un detalle más ancho). */
    className?: Partial<Record<EntityViewMode, string>>
    /** Secciones declarativas; default: una sección `fields` con todo el schema. */
    sections?: readonly DetailSection<TData>[]
    /** Reemplaza el cuerpo completo del detalle. */
    surface?: (args: DetailSurfaceArgs<TData>) => ReactNode
  }
}

/**
 * Identity helper de una entidad: mantiene el tipo `EntityDTO<TData>` fijado en
 * la declaración para que el consumidor tenga autocomplete y errores tempranos.
 */
export function defineEntity<TData>(entity: EntityDTO<TData>): EntityDTO<TData> {
  return entity
}

/** Arguments handed to a custom detail surface. */
export type DetailSurfaceArgs<TData> = {
  /** Live row, re-resolved on every render. */
  row: TData
  ctx: TableActionContext<TData>
  /** Closes the detail view. */
  close: () => void
}

/**
 * User-visible copy of the table chrome. Every label falls back to the
 * component default, so an entity only supplies the ones it wants to own.
 */
export type TableLabels = {
  selectAll?: string
  selectRow?: string
  /** Accessible name of the row actions trigger. */
  openRowMenu?: string
  /** Accessible name of the search field's submit button. */
  searchAction?: string
  rowsPerPage?: string
  columns?: string
  noResults?: string
  previous?: string
  next?: string
  selectedRows?: (selected: number, total: number) => string
  selectedCount?: (count: number) => string
}

/**
 * Confirmation required before running a destructive row or bulk action.
 */
export type ConfirmDTO = {
  title: string
  message: (count: number) => string
  confirmLabel: string
  cancelLabel: string
}

export type TableDTO<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[]
  /**
   * Called with the full row list after every add, update or remove. Providing
   * it hands ownership of the rows to the caller: the table then always renders
   * `data`, so the owner must store the list it receives.
   */
  onDataChange?: (rows: TData[]) => void
  /** Alta, edición y detalle de la entidad, declarados una sola vez. */
  entity?: EntityDTO<TData>
  /** Visible text of the column visibility menu, keyed by column id. */
  columnLabels?: Record<string, string>
  /** Columns rendered by the model but not shown in the table. */
  hiddenColumns?: readonly string[]
  /** Content rendered above the toolbar, with the live rows. */
  header?: (rows: TData[]) => ReactNode
  /**
   * Acciones propias en la fila del toolbar, al lado del buscador (detrás de la
   * barra separadora). Para acciones que no son el alta de la entidad — p. ej.
   * un alta con un formulario de la app.
   */
  toolbarActions?: ReactNode
  search?: { columnId: string; placeholder: string }
  pageSizeOptions?: number[]
  selectable?: boolean
  /**
   * Default surface for create/edit/detail when they don't set their own
   * `view`. Falls back to the global preference of `EntityViewProvider`.
   */
  view?: EntityViewMode
  labels?: TableLabels
  rowActions?: readonly RowActionDTO<TData>[]
  rowActionsMenuLabel?: string
  bulkActions?: readonly BulkActionDTO<TData>[]
  bulkMenuLabel?: string
  confirm?: ConfirmDTO
}

export function defineTableDTO<TData extends RowData>(
  dto: TableDTO<TData>
): TableDTO<TData> {
  return dto
}
