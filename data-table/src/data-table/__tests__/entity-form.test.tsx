import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EntityViewProvider } from "../../entity-view"
import { CreateEntity } from "../entity-form"
import { defineEntitySchema, type EntitySchema } from "../entity-schema"
import { defineEntity } from "../types"

type Project = { id: string; name: string }

const schema = defineEntitySchema({
  fields: [
    {
      kind: "text",
      name: "name",
      label: "Nombre",
      required: true,
      rules: { minLength: 3 },
    },
  ],
  labels: {
    createTitle: "Nuevo proyecto",
    createSubmit: "Crear proyecto",
    cancel: "Cancelar",
    messages: { required: "Este campo es obligatorio" },
  },
})

const projectEntity = defineEntity<Project>({
  schema,
  rowId: (row) => row.id,
  build: (values) => ({ id: "nuevo", name: values.name }),
})

function renderCreate(onSaved: (row?: Project) => void) {
  return render(
    <EntityViewProvider>
      <CreateEntity
        entity={projectEntity}
        open
        mode="page"
        onOpenChange={() => {}}
        onSaved={onSaved}
      />
    </EntityViewProvider>
  )
}

describe("EntityForm a través de CreateEntity", () => {
  it("bloquea el alta sin nombre y muestra el error bajo el campo", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()

    renderCreate(onSaved)

    expect(screen.getByRole("heading", { name: "Nuevo proyecto" })).toBeVisible()

    await user.click(screen.getByRole("button", { name: "Crear proyecto" }))

    expect(
      await screen.findByText("Este campo es obligatorio")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("aria-invalid", "true")
    expect(onSaved).not.toHaveBeenCalled()
  })

  it("valida minLength y guarda la fila armada por build()", async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()

    renderCreate(onSaved)

    const input = screen.getByLabelText("Nombre")
    await user.type(input, "ab")
    await user.click(screen.getByRole("button", { name: "Crear proyecto" }))
    expect(await screen.findByText("At least 3 characters")).toBeInTheDocument()
    expect(onSaved).not.toHaveBeenCalled()

    await user.type(input, "c")
    await user.click(screen.getByRole("button", { name: "Crear proyecto" }))

    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(onSaved).toHaveBeenCalledWith({ id: "nuevo", name: "abc" })
  })
})

type LayoutRow = { id: string }

function renderLayout(schema: EntitySchema) {
  const entity = defineEntity<LayoutRow>({
    schema,
    rowId: (row) => row.id,
    build: () => ({ id: "nuevo" }),
  })

  render(
    <EntityViewProvider>
      <CreateEntity
        entity={entity}
        open
        mode="page"
        onOpenChange={() => {}}
        onSaved={() => {}}
      />
    </EntityViewProvider>
  )
}

const layoutLabels = {
  createTitle: "Nuevo",
  createSubmit: "Crear",
  cancel: "Cancelar",
}

describe("rejilla canónica del formulario", () => {
  it("un textarea ocupa 2 columnas para que el campo siguiente comparta la fila", () => {
    renderLayout(
      defineEntitySchema({
        fields: [
          { kind: "text", name: "nombre", label: "Nombre" },
          { kind: "text", name: "codigo", label: "Código" },
          { kind: "textarea", name: "descripcion", label: "Descripción" },
          { kind: "text", name: "notas", label: "Notas" },
        ],
        labels: layoutLabels,
      })
    )

    expect(screen.getByLabelText("Descripción").closest("div")).toHaveClass(
      "@2xl:col-span-2"
    )
  })

  it("un textarea que queda solo en su fila ocupa las 3 columnas", () => {
    renderLayout(
      defineEntitySchema({
        fields: [
          { kind: "text", name: "nombre", label: "Nombre" },
          { kind: "text", name: "codigo", label: "Código" },
          { kind: "textarea", name: "descripcion", label: "Descripción" },
        ],
        labels: layoutLabels,
      })
    )

    expect(screen.getByLabelText("Descripción").closest("div")).toHaveClass(
      "@2xl:col-span-3"
    )
  })
})
