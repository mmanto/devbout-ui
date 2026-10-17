import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createColumnHelper } from "@tanstack/react-table"
import { describe, expect, it } from "vitest"

import { EntityViewProvider } from "../../entity-view"
import type { DataTableFeatures } from "../features"
import { DataTable } from "../data-table"
import { defineTableDTO, type TableDTO } from "../types"

type Row = { id: string; name: string; status: string }

const rows: Row[] = [
  { id: "1", name: "Ana", status: "activo" },
  { id: "2", name: "Bruno", status: "pausado" },
  { id: "3", name: "Carla", status: "activo" },
]

const helper = createColumnHelper<DataTableFeatures, Row>()
const columns = helper.columns([
  helper.accessor("name", { header: "Nombre", filterFn: "includesString" }),
  helper.accessor("status", { header: "Estado" }),
])

function dto(): TableDTO<Row> {
  return defineTableDTO<Row>({
    columns,
    selectable: false,
    search: { columnId: "name", placeholder: "Buscar proyecto…" },
    labels: {
      noResults: "Sin resultados.",
      previous: "Anterior",
      next: "Siguiente",
    },
  })
}

function renderTable(data: Row[]) {
  return render(
    <EntityViewProvider>
      <DataTable dto={dto()} data={data} />
    </EntityViewProvider>
  )
}

describe("DataTable", () => {
  it("renderiza los encabezados y todas las filas", () => {
    renderTable(rows)

    expect(screen.getByText("Nombre")).toBeInTheDocument()
    expect(screen.getByText("Estado")).toBeInTheDocument()
    expect(screen.getByText("Ana")).toBeInTheDocument()
    expect(screen.getByText("Bruno")).toBeInTheDocument()
    expect(screen.getByText("Carla")).toBeInTheDocument()
    // encabezado + 3 filas
    expect(screen.getAllByRole("row")).toHaveLength(4)
  })

  it("muestra el empty state con el label de la tabla", () => {
    renderTable([])

    expect(screen.getByText("Sin resultados.")).toBeInTheDocument()
    expect(screen.getAllByRole("row")).toHaveLength(2) // header + fila vacía
  })

  it("filtra en vivo por la columna de búsqueda", async () => {
    const user = userEvent.setup()
    renderTable(rows)

    await user.type(screen.getByPlaceholderText("Buscar proyecto…"), "ana")

    expect(screen.getByText("Ana")).toBeInTheDocument()
    expect(screen.queryByText("Bruno")).not.toBeInTheDocument()
    expect(screen.queryByText("Carla")).not.toBeInTheDocument()
  })

  it("pagina: 12 filas → 10 en la primera página y 2 en la segunda", async () => {
    const user = userEvent.setup()
    const many: Row[] = Array.from({ length: 12 }, (_, index) => ({
      id: String(index + 1),
      name: `Proyecto ${String(index + 1).padStart(2, "0")}`,
      status: "activo",
    }))

    renderTable(many)

    expect(screen.getByText("Proyecto 01")).toBeInTheDocument()
    expect(screen.queryByText("Proyecto 12")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Siguiente" }))

    expect(screen.getByText("Proyecto 12")).toBeInTheDocument()
    expect(screen.queryByText("Proyecto 01")).not.toBeInTheDocument()
    expect(screen.getAllByRole("row")).toHaveLength(3) // header + 2 filas
  })
})
