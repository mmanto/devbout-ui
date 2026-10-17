import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"

import {
  EntityView,
  EntityViewProvider,
  useEntityViewMode,
  type EntityViewMode,
} from "./entity-view"

function ModeProbe() {
  const { mode } = useEntityViewMode()
  return <span data-testid="mode">{mode}</span>
}

function renderProbe() {
  return render(
    <EntityViewProvider>
      <ModeProbe />
    </EntityViewProvider>
  )
}

function renderView(props: {
  mode?: EntityViewMode
} = {}) {
  return render(
    <EntityViewProvider>
      <EntityView
        open
        title="Nuevo cliente"
        onOpenChange={() => {}}
        {...props}
      >
        <p>Contenido</p>
      </EntityView>
    </EntityViewProvider>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe("EntityViewProvider", () => {
  it("sin preferencia guardada, la superficie por defecto es page", () => {
    renderProbe()

    expect(screen.getByTestId("mode")).toHaveTextContent("page")
  })

  it("respeta la preferencia guardada en localStorage", () => {
    window.localStorage.setItem("entity-view-mode", "drawer")

    renderProbe()

    expect(screen.getByTestId("mode")).toHaveTextContent("drawer")
  })
})

describe("EntityView", () => {
  it("sin mode ni preferencia, renderiza la página (no un dialog)", () => {
    renderView()

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: "Nuevo cliente" })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /back/i })
    ).toBeInTheDocument()
  })

  it("respeta la preferencia guardada cuando no hay mode forzado", () => {
    window.localStorage.setItem("entity-view-mode", "drawer")

    renderView()

    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("un mode forzado gana sobre la preferencia global", () => {
    window.localStorage.setItem("entity-view-mode", "page")

    renderView({ mode: "drawer" })

    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
