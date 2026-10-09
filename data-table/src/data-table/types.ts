import type { ReactNode } from "react"
import type { ColumnDef, RowData } from "@tanstack/react-table"

import type { DataTableFeatures } from "./features"

export type TableActionContext<TData> = {
  add: (row: TData) => void
  update: (row: TData, next: TData) => void
  remove: (rows: TData[]) => void
  clearSelection: () => void
}

/** Values held by an entity form while editing — every control yields a string. */
export type FieldValues = Record<string, string>

/**
 * Option of a `select` field. A plain string is both the value and the label;
 * use `{ value, label }` when the stored value differs from the visible text
 * (e.g. identifier in the data, Spanish text in the UI).
 */
export type SelectOption = string | { value: string; label: string }

type FieldBase = {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
}

export type FieldDTO =
  | (FieldBase & { kind: "text"; placeholder?: string })
  | (FieldBase & { kind: "textarea"; placeholder?: string; rows?: number })
  | (FieldBase & { kind: "date" })
  | (FieldBase & {
      kind: "number"
      placeholder?: string
      min?: number
      max?: number
      step?: number
    })
  | (FieldBase & { kind: "color" })
  /** Comma separated list of values; `build` splits it into an array. */
  | (FieldBase & { kind: "tags"; placeholder?: string })
  | (FieldBase & {
      kind: "select"
      placeholder?: string
      options: readonly SelectOption[]
    })

export type EntityTitle<TData> = string | ((row: TData) => string)

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

export type CreateDTO<TData> = {
  triggerLabel: string
  /** Trigger button variant; `outline` unless creating is the page's main action. */
  triggerVariant?: "default" | "outline"
  title: string
  description?: string
  submitLabel: string
  cancelLabel?: string
  fields: readonly FieldDTO[]
  build: (values: FieldValues) => TData
}

export type EditDTO<TData> = {
  /** Row action label that opens the edit view. */
  label: string
  /**
   * Route of the edit screen. When set, the row action navigates there instead
   * of opening the edit view over the table.
   */
  href?: (row: TData) => string
  title: EntityTitle<TData>
  description?: string
  submitLabel: string
  cancelLabel?: string
  fields: readonly FieldDTO[]
  /** Current row values, used to seed the form. */
  toValues: (row: TData) => FieldValues
  build: (values: FieldValues, row: TData) => TData
}

export type DetailFieldDTO<TData> = {
  label: string
  value: (row: TData) => ReactNode
}

export type DetailDTO<TData> = {
  /** Row action label that opens the detail view. */
  label: string
  /**
   * Route of the detail screen. When set, opening the detail (row click or row
   * action) navigates there instead of showing it over the table.
   */
  href?: (row: TData) => string
  title: EntityTitle<TData>
  description?: EntityTitle<TData>
  closeLabel?: string
  /** Body of the detail view; omitted when `detailSurface` provides it. */
  fields?: readonly DetailFieldDTO<TData>[]
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
   * Stable identity of a row. Required when the row object is replaced while
   * a detail surface stays open (the surface always receives the live row).
   */
  rowId?: (row: TData) => string
  /**
   * Called with the full row list after every add, update or remove. Providing
   * it hands ownership of the rows to the caller: the table then always renders
   * `data`, so the owner must store the list it receives.
   */
  onDataChange?: (rows: TData[]) => void
  /** Replaces the built-in detail body with an entity-owned surface. */
  detailSurface?: (args: DetailSurfaceArgs<TData>) => ReactNode
  /** Visible text of the column visibility menu, keyed by column id. */
  columnLabels?: Record<string, string>
  /** Columns rendered by the model but not shown in the table. */
  hiddenColumns?: readonly string[]
  /** Content rendered above the toolbar, with the live rows. */
  header?: (rows: TData[]) => ReactNode
  search?: { columnId: string; placeholder: string }
  pageSizeOptions?: number[]
  selectable?: boolean
  labels?: TableLabels
  create?: CreateDTO<TData>
  edit?: EditDTO<TData>
  detail?: DetailDTO<TData>
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
