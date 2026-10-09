"use client"

import * as React from "react"

import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Textarea } from "../ui/textarea"
import { EntityView, type EntityViewMode } from "../entity-view"
import {
  initialValues,
  resolveEntityText,
  toFieldValues,
  validateSchema,
  type EntitySchema,
  type FieldDTO,
  type FieldValues,
} from "./entity-schema"

import type { EntityDTO } from "./types"

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
 * Cuerpo de un formulario de entidad: los campos de alta/edición del schema,
 * repartidos en filas de dos o tres según {@link rowSizes}, con el mensaje de
 * error debajo de cada campo inválido.
 */
export function EntityForm({
  schema,
  values,
  errors,
  onChange,
}: {
  schema: EntitySchema
  values: FieldValues
  errors?: Record<string, string>
  onChange: (name: string, value: string) => void
}) {
  // Los campos `formHidden` (derivados o de sólo-detalle) no se editan.
  const fields = schema.fields.filter((field) => !field.formHidden)

  const items = fields.map((field, index) => {
    const value = values[field.name] ?? ""
    const message = errors?.[field.name]

    return (
      <div key={field.name} className="grid gap-2">
        <label htmlFor={field.name} className="text-xs font-medium">
          {field.label}
        </label>
        {field.kind === "select" ? (
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
            <SelectTrigger
              className="w-full"
              aria-invalid={message ? true : undefined}
            >
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
        ) : (
          <FieldControl
            field={field}
            value={value}
            autoFocus={index === 0}
            invalid={message !== undefined}
            onChange={onChange}
          />
        )}
        {message ? (
          <p role="alert" className="text-xs text-destructive">
            {message}
          </p>
        ) : null}
      </div>
    )
  })

  const rows: React.ReactNode[][] = []
  let offset = 0
  for (const size of rowSizes(fields)) {
    rows.push(items.slice(offset, offset + size))
    offset += size
  }

  const invalid = errors ? Object.keys(errors).length > 0 : false

  return (
    <div className="@container flex flex-col gap-4">
      {rows.map((row, index) => (
        <div key={index} className={ROW_CLASSES[row.length]}>
          {row}
        </div>
      ))}
      {invalid ? (
        <p role="alert" className="text-xs text-destructive">
          {schema.labels?.messages?.invalid ?? "Fix the highlighted fields"}
        </p>
      ) : null}
    </div>
  )
}

/** Control de un campo no-`select` (color, textarea o input). */
function FieldControl({
  field,
  value,
  autoFocus,
  invalid,
  onChange,
}: {
  field: Exclude<FieldDTO, { kind: "select" }>
  value: string
  autoFocus: boolean
  invalid: boolean
  onChange: (name: string, value: string) => void
}) {
  if (field.kind === "color") {
    return (
      <div className="flex items-center gap-2">
        <Input
          id={field.name}
          type="color"
          className="h-7 w-10 cursor-pointer p-0.5"
          value={value}
          aria-invalid={invalid ? true : undefined}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
      </div>
    )
  }

  if (field.kind === "textarea") {
    return (
      <Textarea
        id={field.name}
        rows={field.rows ?? 3}
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        autoFocus={autoFocus}
        aria-invalid={invalid ? true : undefined}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
    )
  }

  return (
    <Input
      id={field.name}
      type={field.kind === "date" ? "date" : field.kind === "number" ? "number" : "text"}
      value={value}
      placeholder={"placeholder" in field ? field.placeholder : undefined}
      min={field.kind === "number" ? field.min : undefined}
      max={field.kind === "number" ? field.max : undefined}
      step={field.kind === "number" ? field.step : undefined}
      required={field.required}
      autoFocus={autoFocus}
      aria-invalid={invalid ? true : undefined}
      onChange={(event) => onChange(field.name, event.target.value)}
    />
  )
}

/** Pie de un formulario de entidad: cancelar y enviar. */
export function EntityFormFooter({
  onCancel,
  cancelLabel,
  submitLabel,
  pending,
}: {
  onCancel: () => void
  cancelLabel: string
  submitLabel: string
  /** Disables the buttons while an async submit is in flight. */
  pending?: boolean
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={pending}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={pending}>
        {submitLabel}
      </Button>
    </div>
  )
}

/**
 * Estado de un formulario de entidad: valores, errores, envío y resultado.
 *
 * Los valores se siembran **una sola vez**: un alta arranca de `initialValues`
 * y una edición de `entity.toValues` (o del default por nombre). Para re-sembrar
 * el form al cambiar de fila, remontá el componente con `key`.
 */
export function useEntityForm<TData>(entity: EntityDTO<TData>, row?: TData) {
  const [values, setValues] = React.useState<FieldValues>(() => {
    const base = initialValues(entity.schema.fields)
    if (row === undefined) {
      return base
    }
    const current = entity.toValues
      ? entity.toValues(row)
      : toFieldValues(entity.schema.fields, row)
    return { ...base, ...current }
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const setField = React.useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    // Corregir un campo limpia su error, así el resumen se achica al tipear.
    setErrors((prev) => {
      if (!(name in prev)) {
        return prev
      }
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  /**
   * Valida (schema + `entity.validate`) y, si pasa, corre `entity.onSubmit`
   * (servidor) o entrega `entity.build(values, row)` (en memoria). Devuelve
   * `false` sin llamar a `onSaved` cuando la validación falla o el envío tira.
   */
  const submit = React.useCallback(
    async (onSaved?: (row?: TData) => void): Promise<boolean> => {
      const found = {
        ...validateSchema(entity.schema, values),
        ...(entity.validate?.(values) ?? {}),
      }

      if (Object.keys(found).length > 0) {
        setErrors(found)
        document.getElementById(Object.keys(found)[0])?.focus()
        return false
      }

      setErrors({})
      setPending(true)
      setError(null)
      try {
        if (entity.onSubmit) {
          await entity.onSubmit(values, row)
          onSaved?.(undefined)
        } else if (entity.build) {
          onSaved?.(entity.build(values, row))
        } else {
          onSaved?.(undefined)
        }
        return true
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo guardar.")
        return false
      } finally {
        setPending(false)
      }
    },
    [entity, values, row]
  )

  return { values, errors, setField, submit, pending, error }
}

/**
 * Alta de una entidad: el formulario derivado de su schema, dentro de la
 * superficie elegida (modal / drawer / página).
 */
export function CreateEntity<TData>({
  entity,
  open,
  mode,
  onOpenChange,
  onSaved,
  header,
}: {
  entity: EntityDTO<TData>
  open: boolean
  /** Fuerza la superficie en vez de la preferencia global. */
  mode?: EntityViewMode
  onOpenChange: (open: boolean) => void
  /** Se llama sólo si el envío salió bien; `row` es la fila armada, o `undefined` contra la API. */
  onSaved?: (row?: TData) => void
  /** Bloque entre el título y los campos: recibe los valores vivos y la fila previsualizada. */
  header?: (values: FieldValues, preview: TData | undefined) => React.ReactNode
}) {
  const { values, errors, setField, submit, pending, error } = useEntityForm(entity)
  const labels = entity.schema.labels
  const create = entity.create
  const preview = entity.build?.(values, undefined)
  const cancelLabel = labels?.cancel ?? "Cancel"

  return (
    <EntityView
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      title={resolveEntityText(create?.title, preview, labels?.createTitle ?? "New")}
      description={
        resolveEntityText(create?.description, preview, labels?.createDescription ?? "") ||
        undefined
      }
      closeLabel={labels?.cancel}
      footer={
        <EntityFormFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel={cancelLabel}
          submitLabel={create?.submitLabel ?? labels?.createSubmit ?? "Create"}
          pending={pending}
        />
      }
      onSubmit={(event) => {
        event.preventDefault()
        void submit((row) => {
          onSaved?.(row)
          onOpenChange(false)
        })
      }}
    >
      {header?.(values, preview)}
      <EntityForm
        schema={entity.schema}
        values={values}
        errors={errors}
        onChange={setField}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </EntityView>
  )
}

/**
 * Edición de una entidad: el mismo formulario del schema, sembrado con la fila
 * y con la superficie propia de la acción.
 */
export function EditEntity<TData>({
  entity,
  row,
  open,
  mode,
  onOpenChange,
  onSaved,
  header,
}: {
  entity: EntityDTO<TData>
  row: TData
  open: boolean
  /** Fuerza la superficie en vez de la preferencia global (pantallas propias). */
  mode?: EntityViewMode
  onOpenChange: (open: boolean) => void
  onSaved?: (row?: TData) => void
  header?: (values: FieldValues, preview: TData | undefined) => React.ReactNode
}) {
  const { values, errors, setField, submit, pending, error } = useEntityForm(
    entity,
    row
  )
  const labels = entity.schema.labels
  const edit = entity.edit
  const preview = entity.build?.(values, row)
  const cancelLabel = labels?.cancel ?? "Cancel"

  return (
    <EntityView
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      title={resolveEntityText(edit?.title, row, labels?.editTitle ?? "Edit")}
      description={
        resolveEntityText(edit?.description, row, labels?.editDescription ?? "") ||
        undefined
      }
      closeLabel={labels?.cancel}
      backLabel={cancelLabel}
      footer={
        <EntityFormFooter
          onCancel={() => onOpenChange(false)}
          cancelLabel={cancelLabel}
          submitLabel={edit?.submitLabel ?? labels?.editSubmit ?? "Save"}
          pending={pending}
        />
      }
      onSubmit={(event) => {
        event.preventDefault()
        void submit((next) => {
          onSaved?.(next)
          onOpenChange(false)
        })
      }}
    >
      {header?.(values, preview)}
      <EntityForm
        schema={entity.schema}
        values={values}
        errors={errors}
        onChange={setField}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </EntityView>
  )
}
