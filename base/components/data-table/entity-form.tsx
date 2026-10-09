"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { EntityView, type EntityViewMode } from "@/components/entity-view"

import type { CreateDTO, EditDTO, FieldDTO, FieldValues } from "./types"

function initialValues(fields: readonly FieldDTO[]): FieldValues {
  return Object.fromEntries(
    fields.map((field) => {
      if (field.defaultValue !== undefined) {
        return [field.name, field.defaultValue]
      }
      if (field.kind === "select" && field.options[0] !== undefined) {
        const first = field.options[0]
        return [field.name, typeof first === "string" ? first : first.value]
      }
      return [field.name, ""]
    })
  )
}

/** Campos de texto libre: necesitan media fila, no un tercio. */
const TEXT_FIELD_KINDS: readonly FieldDTO["kind"][] = [
  "text",
  "textarea",
  "tags",
]

/**
 * Clases de cada fila. Las filas se apilan cuando el contenedor es angosto (el
 * drawer), y se reparten en columnas cuando hay ancho (pantalla propia, modal).
 */
const ROW_CLASSES: Record<number, string> = {
  1: "grid gap-4",
  2: "grid gap-4 @md:grid-cols-2",
  3: "grid gap-4 @md:grid-cols-2 @2xl:grid-cols-3",
}

/**
 * Cuántos campos lleva cada fila: dos cuando la fila incluye un campo de texto
 * libre, tres cuando no. Se recorre en orden, así el reparto depende del orden
 * de `fields`.
 */
function rowSizes(fields: readonly FieldDTO[]): number[] {
  const sizes: number[] = []
  let size = 0
  let hasTextField = false

  for (const field of fields) {
    const isTextField = TEXT_FIELD_KINDS.includes(field.kind)

    if (size === 3 || (size === 2 && (hasTextField || isTextField))) {
      sizes.push(size)
      size = 0
      hasTextField = false
    }

    size += 1
    hasTextField ||= isTextField
  }

  if (size > 0) {
    sizes.push(size)
  }

  return sizes
}

/**
 * Campos de un formulario de entidad. Se exporta para que una superficie propia
 * (por ejemplo la edición de un proyecto, que agrega su propio resumen) reuse la
 * misma presentación de campos que {@link CreateEntity} y {@link EditEntity}.
 *
 * Los campos se reparten en filas de dos o tres según {@link rowSizes}.
 */
export function EntityFormFields({
  fields,
  values,
  onChange,
}: {
  fields: readonly FieldDTO[]
  values: FieldValues
  onChange: (name: string, value: string) => void
}) {
  const items = fields.map((field, index) => {
    const value = values[field.name] ?? ""

    if (field.kind === "select") {
      return (
        <div key={field.name} className="grid gap-2">
          <label htmlFor={field.name} className="text-xs font-medium">
            {field.label}
          </label>
          <Select
            id={field.name}
            value={value}
            items={field.options.map((option) =>
              typeof option === "string"
                ? { value: option, label: option }
                : option
            )}
            onValueChange={(next) => onChange(field.name, next ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => {
                const optionValue =
                  typeof option === "string" ? option : option.value
                return (
                  <SelectItem key={optionValue} value={optionValue}>
                    {typeof option === "string" ? option : option.label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      )
    }

    return (
      <div key={field.name} className="grid gap-2">
        <label htmlFor={field.name} className="text-xs font-medium">
          {field.label}
        </label>
        {field.kind === "color" ? (
          <div className="flex items-center gap-2">
            <Input
              id={field.name}
              type="color"
              className="h-7 w-10 cursor-pointer p-0.5"
              value={value}
              onChange={(event) => onChange(field.name, event.target.value)}
            />
            <span className="font-mono text-xs text-muted-foreground">
              {value}
            </span>
          </div>
        ) : field.kind === "textarea" ? (
          <Textarea
            id={field.name}
            rows={field.rows ?? 3}
            value={value}
            placeholder={field.placeholder}
            required={field.required}
            autoFocus={index === 0}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
        ) : (
          <Input
            id={field.name}
            type={
              field.kind === "date"
                ? "date"
                : field.kind === "number"
                  ? "number"
                  : "text"
            }
            value={value}
            placeholder={
              field.kind === "text" ||
              field.kind === "number" ||
              field.kind === "tags"
                ? field.placeholder
                : undefined
            }
            min={field.kind === "number" ? field.min : undefined}
            max={field.kind === "number" ? field.max : undefined}
            step={field.kind === "number" ? field.step : undefined}
            required={field.required}
            autoFocus={index === 0}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
        )}
      </div>
    )
  })

  const rows: React.ReactNode[][] = []
  let offset = 0
  for (const size of rowSizes(fields)) {
    rows.push(items.slice(offset, offset + size))
    offset += size
  }

  return (
    <div className="@container flex flex-col gap-4">
      {rows.map((row, index) => (
        <div key={index} className={ROW_CLASSES[row.length]}>
          {row}
        </div>
      ))}
    </div>
  )
}

/** Pie de un formulario de entidad: cancelar y enviar. */
export function FormFooter({
  onCancel,
  cancelLabel,
  submitLabel,
}: {
  onCancel: () => void
  cancelLabel: string
  submitLabel: string
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="submit">{submitLabel}</Button>
    </div>
  )
}

export function CreateEntity<TData>({
  create,
  open,
  onOpenChange,
  onSubmit,
}: {
  create: CreateDTO<TData>
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (row: TData) => void
}) {
  const emptyValues = React.useMemo(
    () => initialValues(create.fields),
    [create.fields]
  )
  const [values, setValues] = React.useState<FieldValues>(emptyValues)

  return (
    <EntityView
      open={open}
      onOpenChange={onOpenChange}
      title={create.title}
      description={create.description}
      closeLabel={create.cancelLabel}
      footer={
        <FormFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel={create.cancelLabel ?? "Cancel"}
          submitLabel={create.submitLabel}
        />
      }
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(create.build(values))
      }}
    >
      <EntityFormFields
        fields={create.fields}
        values={values}
        onChange={(name, value) =>
          setValues((prev) => ({ ...prev, [name]: value }))
        }
      />
    </EntityView>
  )
}

export function EditEntity<TData>({
  edit,
  row,
  open,
  mode,
  onOpenChange,
  onSubmit,
}: {
  edit: EditDTO<TData>
  row: TData
  open: boolean
  /** Fuerza la superficie en vez de la preferencia global (pantallas propias). */
  mode?: EntityViewMode
  onOpenChange: (open: boolean) => void
  onSubmit: (row: TData) => void
}) {
  const rowValues = React.useMemo(() => edit.toValues(row), [edit, row])
  const [values, setValues] = React.useState<FieldValues>(rowValues)

  return (
    <EntityView
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      title={typeof edit.title === "function" ? edit.title(row) : edit.title}
      description={edit.description}
      closeLabel={edit.cancelLabel}
      backLabel={edit.cancelLabel}
      footer={
        <FormFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel={edit.cancelLabel ?? "Cancel"}
          submitLabel={edit.submitLabel}
        />
      }
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit(edit.build(values, row))
      }}
    >
      <EntityFormFields
        fields={edit.fields}
        values={values}
        onChange={(name, value) =>
          setValues((prev) => ({ ...prev, [name]: value }))
        }
      />
    </EntityView>
  )
}
