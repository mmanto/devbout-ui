import { describe, expect, it } from "vitest"

import {
  defineEntitySchema,
  initialValues,
  toFieldValues,
  validateField,
  validateSchema,
  type FieldDTO,
} from "../entity-schema"

const schema = defineEntitySchema({
  fields: [
    {
      kind: "text",
      name: "name",
      label: "Nombre",
      required: true,
      rules: { minLength: 3, maxLength: 10 },
    },
    {
      kind: "text",
      name: "email",
      label: "Email",
      rules: { pattern: "^\\S+@\\S+$", patternMessage: "Email inválido" },
    },
    {
      kind: "number",
      name: "hours",
      label: "Horas",
      min: 1,
      max: 8,
    },
    {
      kind: "select",
      name: "status",
      label: "Estado",
      options: ["nuevo", { value: "listo", label: "Listo" }],
    },
    { kind: "tags", name: "tags", label: "Etiquetas" },
    { kind: "text", name: "slug", label: "Slug", formHidden: true },
  ],
  labels: {
    messages: {
      required: "Este campo es obligatorio",
      maxLength: "Máximo {n} caracteres",
    },
  },
})

function field(name: string): FieldDTO {
  const found = schema.fields.find((current) => current.name === name)
  if (!found) {
    throw new Error(`fixture sin campo ${name}`)
  }
  return found
}

describe("EntitySchema — validación", () => {
  it("marca el requerido vacío con el mensaje traducido", () => {
    expect(validateField(field("name"), "   ", schema.labels)).toBe(
      "Este campo es obligatorio"
    )
  })

  it("usa los defaults en inglés cuando la entidad no traduce el mensaje", () => {
    expect(validateField(field("name"), "ab", schema.labels)).toBe(
      "At least 3 characters"
    )
  })

  it("respeta el mensaje traducido con interpolación de {n}", () => {
    expect(validateField(field("name"), "una banda de rock", schema.labels)).toBe(
      "Máximo 10 caracteres"
    )
  })

  it("aplica pattern y patternMessage", () => {
    expect(validateField(field("email"), "sin-arroba", schema.labels)).toBe(
      "Email inválido"
    )
    expect(validateField(field("email"), "a@b.co", schema.labels)).toBeNull()
  })

  it("valida el rango de los campos number", () => {
    expect(validateField(field("hours"), "0", schema.labels)).toBe("Minimum 1")
    expect(validateField(field("hours"), "9", schema.labels)).toBe("Maximum 8")
    expect(validateField(field("hours"), "abc", schema.labels)).toBe(
      "Invalid format"
    )
    expect(validateField(field("hours"), "4", schema.labels)).toBeNull()
  })

  it("un campo opcional vacío no produce error", () => {
    expect(validateField(field("email"), "", schema.labels)).toBeNull()
  })

  it("validateSchema devuelve sólo los campos inválidos, y {} si pasa todo", () => {
    expect(validateSchema(schema, {})).toEqual({
      name: "Este campo es obligatorio",
    })

    expect(
      validateSchema(schema, {
        name: "Ciudad",
        email: "a@b.co",
        hours: "4",
        status: "nuevo",
        tags: "uno, dos",
        slug: "",
      })
    ).toEqual({})
  })
})

describe("EntitySchema — valores de formulario", () => {
  it("initialValues usa defaultValue, la primera opción del select o vacío", () => {
    expect(initialValues(schema.fields)).toEqual({
      name: "",
      email: "",
      hours: "",
      status: "nuevo",
      tags: "",
      slug: "",
    })
  })

  it("toFieldValues serializa arrays, números y nulls", () => {
    const values = toFieldValues(schema.fields, {
      name: "Ciudad",
      email: null,
      hours: 4,
      status: "listo",
      tags: ["uno", "dos"],
      slug: "ciudad",
    })

    expect(values).toEqual({
      name: "Ciudad",
      email: "",
      hours: "4",
      status: "listo",
      tags: "uno, dos",
      slug: "ciudad",
    })
  })
})
