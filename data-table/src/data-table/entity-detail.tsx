"use client"

import * as React from "react"

import { cn } from "../lib/utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  EntityView,
  useEntityFormat,
  type EntityFormat,
  type EntityViewMode,
} from "../entity-view"
import {
  resolveEntityText,
  type EntitySchema,
  type FieldDTO,
} from "./entity-schema"

import type { DetailSection, EntityDTO, TableActionContext } from "./types"

/**
 * Valor de un campo del detalle, dibujado según su `kind`. Los `select` con
 * `display: "badge"` se pintan como {@link Badge}.
 */
function renderFieldValue(
  field: FieldDTO,
  row: unknown,
  format: EntityFormat,
  empty: string
): React.ReactNode {
  const raw = (row as Record<string, unknown>)[field.name]

  if (raw === null || raw === undefined || raw === "") {
    return empty
  }

  switch (field.kind) {
    case "text":
    case "textarea":
      return String(raw)
    case "number": {
      const value = Number(raw)
      return Number.isFinite(value) ? format.formatNumber(value) : String(raw)
    }
    case "date":
      return format.formatDate(String(raw))
    case "color":
      return (
        <span className="inline-flex items-center gap-2">
          <span
            className="size-3 rounded-sm border"
            style={{ backgroundColor: String(raw) }}
          />
          <span className="font-mono text-xs">{String(raw)}</span>
        </span>
      )
    case "tags": {
      const items = Array.isArray(raw)
        ? raw.map(String)
        : String(raw)
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean)
      if (items.length === 0) {
        return empty
      }
      return (
        <span className="flex flex-wrap gap-1">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-border px-1.5 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </span>
      )
    }
    case "select": {
      const value = String(raw)
      const option = field.options.find(
        (candidate) =>
          (typeof candidate === "string" ? candidate : candidate.value) === value
      )
      const label = typeof option === "string" ? option : (option?.label ?? value)
      if (field.display === "badge") {
        return (
          <Badge
            variant={
              typeof option === "string"
                ? "secondary"
                : (option?.variant ?? "secondary")
            }
          >
            {label}
          </Badge>
        )
      }
      return label
    }
  }
}

/** Bloque de campos de un detalle declarativo. */
function FieldsSection({
  schema,
  names,
  title,
  row,
  format,
}: {
  schema: EntitySchema
  names?: readonly string[]
  title?: string
  row: unknown
  format: EntityFormat
}) {
  const empty = schema.labels?.empty ?? "—"
  const fields = names
    ? names
        .map((name) => schema.fields.find((field) => field.name === name))
        .filter((field): field is FieldDTO => field !== undefined)
    : schema.fields.filter((field) => !field.view?.hidden)

  return (
    <section className="grid gap-2">
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      <dl className="@container grid gap-4 @md:grid-cols-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className={cn(
              "grid gap-1",
              field.view?.span === 2 && "@md:col-span-2"
            )}
          >
            <dt className="text-xs font-medium text-muted-foreground">
              {field.label}
            </dt>
            <dd className="text-sm">
              {renderFieldValue(field, row, format, empty)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * Detalle de una entidad, dibujado desde su schema: los campos se leen por
 * `kind` y las secciones se declaran en `entity.detail.sections`. Una entidad
 * con un cuerpo propio (pestañas, métricas, tablas hijas) lo aporta con
 * `entity.detail.surface`.
 */
export function DetailEntity<TData>({
  entity,
  row,
  open,
  mode,
  onOpenChange,
  ctx,
}: {
  entity: EntityDTO<TData>
  row: TData
  open: boolean
  /** Fuerza la superficie en vez de la preferencia global. */
  mode?: EntityViewMode
  onOpenChange: (open: boolean) => void
  /** Necesario sólo si `entity.detail.surface` lo usa; default: contexto no-op. */
  ctx?: TableActionContext<TData>
}) {
  const format = useEntityFormat()
  const detail = entity.detail

  // Tipado dentro del componente: un `TableActionContext<never>` de módulo no
  // es asignable bajo `strictFunctionTypes`.
  const fallbackCtx = React.useMemo<TableActionContext<TData>>(
    () => ({ add() {}, update() {}, remove() {}, clearSelection() {} }),
    []
  )

  const sections: readonly DetailSection<TData>[] = detail?.sections ?? [
    { kind: "fields" },
  ]
  const closeLabel =
    detail?.closeLabel ?? entity.schema.labels?.detailClose ?? "Close"

  return (
    <EntityView
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      className={detail?.className}
      title={
        resolveEntityText(
          detail?.title,
          row,
          entity.schema.labels?.detailTitle ?? ""
        ) || undefined
      }
      description={resolveEntityText(detail?.description, row, "") || undefined}
      closeLabel={closeLabel}
      backLabel={closeLabel}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {closeLabel}
          </Button>
        </div>
      }
    >
      {detail?.surface
        ? detail.surface({
            row,
            ctx: ctx ?? fallbackCtx,
            close: () => onOpenChange(false),
          })
        : sections.map((section, index) =>
            section.kind === "custom" ? (
              <React.Fragment key={index}>
                {section.render(row)}
              </React.Fragment>
            ) : (
              <FieldsSection
                key={index}
                schema={entity.schema}
                names={section.fields}
                title={section.title}
                row={row}
                format={format}
              />
            )
          )}
    </EntityView>
  )
}
