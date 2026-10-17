import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { EntityViewProvider } from "../../entity-view"
import { CreateEntity } from "../entity-form"
import { defineEntitySchema } from "../entity-schema"
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
