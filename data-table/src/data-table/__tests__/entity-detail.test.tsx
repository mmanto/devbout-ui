import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { EntityViewProvider } from "../../entity-view"
import { DetailEntity } from "../entity-detail"
import { defineEntitySchema } from "../entity-schema"
import { defineEntity } from "../types"

type Row = {
  id: string
  nombre: string
  codigo: string
  estado: string
  descripcion: string
  notas: string
}

const row: Row = {
  id: "x",
  nombre: "Nombre",
  codigo: "Código",
  estado: "Activo",
  descripcion: "Texto largo",
  notas: "Notas",
}

const schema = defineEntitySchema({
  fields: [
    { kind: "text", name: "nombre", label: "Nombre" },
    { kind: "text", name: "codigo", label: "Código" },
    { kind: "text", name: "estado", label: "Estado" },
    { kind: "textarea", name: "descripcion", label: "Descripción" },
    { kind: "text", name: "notas", label: "Notas" },
  ],
  labels: { detailClose: "Cerrar" },
})

const entity = defineEntity<Row>({
  schema,
  rowId: (record) => record.id,
  build: () => row,
})

describe("detalle de entidad", () => {
  it("usa la rejilla de 1/2/3 columnas y da 2 columnas al textarea", () => {
    const { container } = render(
      <EntityViewProvider>
        <DetailEntity
          entity={entity}
          row={row}
          open
          mode="page"
          onOpenChange={() => {}}
        />
      </EntityViewProvider>
    )

    expect(container.querySelector("dl")).toHaveClass("@2xl:grid-cols-3")
    expect(screen.getByText("Descripción").closest("div")).toHaveClass(
      "@2xl:col-span-2"
    )
  })

  it("da 3 columnas al textarea cuando queda solo en su fila", () => {
    const lastSchema = defineEntitySchema({
      fields: [
        { kind: "text", name: "nombre", label: "Nombre" },
        { kind: "text", name: "codigo", label: "Código" },
        { kind: "text", name: "estado", label: "Estado" },
        { kind: "textarea", name: "descripcion", label: "Descripción" },
      ],
      labels: { detailClose: "Cerrar" },
    })
    const lastEntity = defineEntity<Row>({
      schema: lastSchema,
      rowId: (record) => record.id,
      build: () => row,
    })

    render(
      <EntityViewProvider>
        <DetailEntity
          entity={lastEntity}
          row={row}
          open
          mode="page"
          onOpenChange={() => {}}
        />
      </EntityViewProvider>
    )

    // El textarea arranca fila (3 campos previos) y no tiene siguiente: ocupa
    // las 3 columnas.
    expect(screen.getByText("Descripción").closest("div")).toHaveClass(
      "@2xl:col-span-3"
    )
  })
})