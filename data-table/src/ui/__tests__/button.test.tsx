import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button, buttonVariants } from "../button"

describe("Button", () => {
  it("renderiza el contenido con la variante default", () => {
    render(<Button>Guardar</Button>)

    const button = screen.getByRole("button", { name: "Guardar" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-primary")
    expect(button).toHaveAttribute("data-slot", "button")
  })

  it("aplica la variante destructiva y el tamaño solicitado", () => {
    render(
      <Button variant="destructive" size="sm">
        Eliminar
      </Button>
    )

    expect(screen.getByRole("button", { name: "Eliminar" })).toHaveClass(
      "bg-destructive/10"
    )
  })

  it("dispara onClick y respeta disabled", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    const { rerender } = render(<Button onClick={onClick}>Enviar</Button>)
    await user.click(screen.getByRole("button", { name: "Enviar" }))
    expect(onClick).toHaveBeenCalledTimes(1)

    rerender(
      <Button onClick={onClick} disabled>
        Enviar
      </Button>
    )
    const disabled = screen.getByRole("button", { name: "Enviar" })
    expect(disabled).toBeDisabled()
    await user.click(disabled)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it("buttonVariants compone variante, tamaño y clases sueltas", () => {
    const classes = buttonVariants({
      variant: "outline",
      size: "sm",
      className: "ml-auto",
    })

    expect(classes).toContain("border-border")
    expect(classes).toContain("h-6")
    expect(classes).toContain("ml-auto")
  })
})
