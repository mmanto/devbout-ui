/**
 * Schema serializable de una entidad: campos, etiquetas y reglas.
 *
 * Este archivo es la única declaración de *forma* de un formulario de entidad.
 * Todo lo que hay acá es JSON puro (primitivos, objetos planos y arrays): no
 * hay funciones, así que un schema se puede serializar, guardar o enviar por
 * la red. Las funciones de glue (armar la fila, resolver la identidad, la
 * superficie de detalle) viven en `EntityDTO` (`types.ts`).
 */

import type { EntityViewMode } from "../entity-view"
import type { BadgeVariant } from "../ui/badge"

/** Valores del formulario mientras se edita — todo control devuelve un string. */
export type FieldValues = Record<string, string>

/** Etiqueta visible o texto derivado de la fila (glue, no forma parte del schema). */
export type EntityTitle<TData> = string | ((row: TData) => string)
export type EntityText<TData> = string | ((row: TData) => string)

/**
 * Opción de un `select`. Un string es valor y etiqueta; `{ value, label, variant }`
 * se usa cuando el valor almacenado difiere del texto (p. ej. `in_progress` →
 * "En progreso") y/o el detalle debe pintarla como `Badge`.
 */
export type SelectOption =
  | string
  | { value: string; label: string; variant?: BadgeVariant }

/** Reglas de validación por campo. Serializables; `pattern` se compila con `new RegExp`. */
export type FieldRules = {
  minLength?: number
  maxLength?: number
  pattern?: string
  /** Mensaje cuando `pattern` falla; pisa `labels.messages.pattern`. */
  patternMessage?: string
}

/** Opciones de presentación del campo en el detalle. */
export type FieldView = {
  /** Oculta el campo en la vista de detalle. Default `false`. */
  hidden?: boolean
  /** Ocupa el ancho completo de la grilla de detalle (`2`). Default `1`. */
  span?: 1 | 2
}

type FieldBase = {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
  rules?: FieldRules
  view?: FieldView
  /** Oculta el campo en los formularios de alta/edición (p. ej. un derivado). */
  formHidden?: boolean
}

export type FieldDTO =
  | (FieldBase & { kind: "text"; placeholder?: string })
  | (FieldBase & { kind: "textarea"; placeholder?: string; rows?: number })
  | (FieldBase & {
      kind: "number"
      placeholder?: string
      min?: number
      max?: number
      step?: number
    })
  | (FieldBase & { kind: "date" })
  | (FieldBase & { kind: "color" })
  /** Lista separada por comas; el consumidor la parte en `build`. */
  | (FieldBase & { kind: "tags"; placeholder?: string })
  | (FieldBase & {
      kind: "select"
      placeholder?: string
      options: readonly SelectOption[]
      /** Cómo se ve en el detalle. Default `"text"`. */
      display?: "text" | "badge"
    })

export type EntityMessages = {
  required?: string
  minLength?: string
  maxLength?: string
  pattern?: string
  min?: string
  max?: string
  /** Resumen mostrado en el cuerpo del formulario cuando hay errores. */
  invalid?: string
}

/**
 * Textos de la entidad. Todo cae a un default en inglés del paquete, así que la
 * app sólo declara los que quiere traducir.
 */
export type EntityLabels = {
  createLabel?: string
  createTitle?: string
  createDescription?: string
  createSubmit?: string
  editLabel?: string
  editTitle?: string
  editDescription?: string
  editSubmit?: string
  detailLabel?: string
  detailTitle?: string
  detailClose?: string
  cancel?: string
  /** Valor vacío en el detalle. Default `"—"`. */
  empty?: string
  messages?: EntityMessages
}

/** Spec serializable: qué renderizar en cualquier modo de la entidad. */
export type EntitySchema = {
  fields: readonly FieldDTO[]
  labels?: EntityLabels
  /** Superficie por defecto de los tres modos. */
  view?: EntityViewMode
}

/**
 * Identity helper del schema: existe para que el consumidor declare el tipo en
 * un solo lugar y el editor autocomplete los campos.
 */
export function defineEntitySchema(schema: EntitySchema): EntitySchema {
  return schema
}

/**
 * Resuelve una etiqueta que puede ser estática (`"Nuevo"`) o derivada de la
 * fila (`(row) => row.name`). Sin fila (un alta sin `build`), cae al texto fijo.
 */
export function resolveEntityText<TData>(
  value: EntityTitle<TData> | EntityText<TData> | undefined,
  row: TData | undefined,
  fallback: string
): string {
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "function" && row !== undefined) {
    return value(row)
  }
  return fallback
}

const DEFAULT_MESSAGES = {
  required: "This field is required",
  minLength: "At least {n} characters",
  maxLength: "At most {n} characters",
  pattern: "Invalid format",
  min: "Minimum {n}",
  max: "Maximum {n}",
} as const

function fill(template: string, count: number): string {
  return template.replace("{n}", String(count))
}

/**
 * Aplica las reglas de un campo a un valor del formulario. Devuelve el mensaje
 * del primer fallo, o `null` si el valor pasa.
 */
export function validateField(
  field: FieldDTO,
  value: string,
  labels?: EntityLabels
): string | null {
  const v = value.trim()
  const messages = labels?.messages

  if (field.required && v === "") {
    return messages?.required ?? DEFAULT_MESSAGES.required
  }

  if (v === "") {
    return null
  }

  const rules = field.rules

  if (rules?.minLength !== undefined && v.length < rules.minLength) {
    return fill(
      messages?.minLength ?? DEFAULT_MESSAGES.minLength,
      rules.minLength
    )
  }

  if (rules?.maxLength !== undefined && v.length > rules.maxLength) {
    return fill(
      messages?.maxLength ?? DEFAULT_MESSAGES.maxLength,
      rules.maxLength
    )
  }

  if (rules?.pattern !== undefined) {
    let expression: RegExp | null = null
    try {
      expression = new RegExp(rules.pattern)
    } catch {
      // Un patrón inválido es un error de programación, no del usuario: se
      // ignora la regla en vez de bloquear el formulario para siempre.
      expression = null
    }
    if (expression && !expression.test(v)) {
      return rules.patternMessage ?? messages?.pattern ?? DEFAULT_MESSAGES.pattern
    }
  }

  if (field.kind === "number") {
    const n = Number(v)
    if (!Number.isFinite(n)) {
      return messages?.pattern ?? DEFAULT_MESSAGES.pattern
    }
    if (field.min !== undefined && n < field.min) {
      return fill(messages?.min ?? DEFAULT_MESSAGES.min, field.min)
    }
    if (field.max !== undefined && n > field.max) {
      return fill(messages?.max ?? DEFAULT_MESSAGES.max, field.max)
    }
  }

  return null
}

/** Mapa `name → mensaje` de todos los campos inválidos. `{}` si pasa todo. */
export function validateSchema(
  schema: EntitySchema,
  values: FieldValues
): Record<string, string> {
  const errors: Record<string, string> = {}

  for (const field of schema.fields) {
    const message = validateField(
      field,
      values[field.name] ?? "",
      schema.labels
    )
    if (message) {
      errors[field.name] = message
    }
  }

  return errors
}

/**
 * Valores iniciales de un alta: `defaultValue`, si no la primera opción del
 * `select`, si no `""`.
 */
export function initialValues(fields: readonly FieldDTO[]): FieldValues {
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

/**
 * Valores del formulario a partir de una fila, por `field.name`. Un array se
 * une con `", "` (el contrato de `tags`); `null`/`undefined` se vuelven `""`.
 */
export function toFieldValues<TData>(
  fields: readonly FieldDTO[],
  row: TData
): FieldValues {
  const source = row as Record<string, unknown>

  return Object.fromEntries(
    fields.map((field) => {
      const raw = source[field.name]
      if (raw === null || raw === undefined) {
        return [field.name, ""]
      }
      if (Array.isArray(raw)) {
        return [field.name, raw.join(", ")]
      }
      return [field.name, String(raw)]
    })
  )
}
