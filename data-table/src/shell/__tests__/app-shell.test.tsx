import type { ComponentProps } from "react"

import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { AppShell, readSidebarOpen } from "../app-shell"
import type { NavItem, ShellUser } from "../types"

const nav: NavItem[] = [
  { title: "Deployments", href: "/deployments" },
  { title: "Proyectos", href: "/projects" },
  {
    title: "Playground",
    href: "#",
    children: [
      { title: "History", href: "/playground/history" },
      { title: "Settings", href: "/playground/settings" },
    ],
  },
]

const user: ShellUser = {
  name: "shadcn",
  description: "m@example.com",
  settingsHref: "/settings/general",
  onLogout: () => {},
}

function renderShell(
  props: Partial<ComponentProps<typeof AppShell>> = {}
) {
  return render(
    <AppShell nav={nav} user={user} brand={{ title: "Acme Inc" }} {...props}>
      <p>contenido</p>
    </AppShell>
  )
}

/**
 * Base UI difiere la apertura de los menús a un `requestAnimationFrame`; en
 * jsdom hay que dejar correr ese frame dentro de `act` antes de consultar el
 * popup.
 */
async function nextFrame() {
  const { promise, resolve } = Promise.withResolvers<void>()
  requestAnimationFrame(() => resolve())
  await act(() => promise)
}

/** Los links del menú, sin el breadcrumb (que también expone `role="link"`). */
function navRegion() {
  return within(
    document.querySelector('[data-slot="sidebar-content"]') as HTMLElement
  )
}

describe("AppShell", () => {
  it("pinta la marca, la navegación y el contenedor", () => {
    renderShell()

    expect(screen.getByText("Acme Inc")).toBeInTheDocument()
    expect(navRegion().getByRole("link", { name: "Deployments" })).toBeInTheDocument()
    expect(navRegion().getByRole("link", { name: "Proyectos" })).toBeInTheDocument()
    expect(screen.getByText("contenido")).toBeInTheDocument()
    expect(screen.getByText("shadcn")).toBeInTheDocument()
  })

  it("marca el ítem activo por pathname (match de prefijo)", () => {
    renderShell({ pathname: "/projects/42" })

    expect(navRegion().getByRole("link", { name: "Proyectos" })).toHaveAttribute(
      "data-active"
    )
    expect(
      navRegion().getByRole("link", { name: "Deployments" })
    ).not.toHaveAttribute("data-active")
  })

  it("deriva el breadcrumb del pathname y del menú", () => {
    renderShell({ pathname: "/projects/42" })

    const breadcrumb = within(
      screen.getByRole("navigation", { name: "breadcrumb" })
    )
    expect(breadcrumb.getByText("Proyectos")).toBeInTheDocument()
  })

  it("usa renderLink para los links del menú", () => {
    renderShell({
      pathname: "/projects",
      renderLink: (href) => <a data-router href={href} />,
    })

    expect(navRegion().getByRole("link", { name: "Proyectos" })).toHaveAttribute(
      "data-router"
    )
  })

  it("abre el submenú y lo deja abierto si un hijo está activo", async () => {
    const withActiveChild = renderShell({ pathname: "/playground/history" })

    expect(
      navRegion().getByRole("link", { name: "History" })
    ).toBeInTheDocument()
    withActiveChild.unmount()

    renderShell({ pathname: "/deployments" })
    expect(
      navRegion().queryByRole("link", { name: "History" })
    ).not.toBeInTheDocument()

    fireEvent.click(navRegion().getByRole("button", { name: "Playground" }))
    await nextFrame()

    expect(
      navRegion().getByRole("link", { name: "History" })
    ).toBeInTheDocument()
  })

  it("arma el menú de usuario con Ajustes y Cerrar sesión", async () => {
    const onLogout = vi.fn()
    renderShell({
      user: { ...user, onLogout },
      labels: { settings: "Ajustes", logout: "Cerrar sesión" },
    })

    fireEvent.mouseDown(screen.getByRole("button", { name: /shadcn/ }))
    await nextFrame()

    expect(screen.getByRole("menuitem", { name: "Ajustes" })).toHaveAttribute(
      "href",
      "/settings/general"
    )
    fireEvent.click(screen.getByRole("menuitem", { name: "Cerrar sesión" }))
    expect(onLogout).toHaveBeenCalledTimes(1)
  })

  it("pinta headerActions a la derecha del header", () => {
    renderShell({ headerActions: <button>Notificaciones</button> })

    expect(
      screen.getByRole("button", { name: "Notificaciones" })
    ).toBeInTheDocument()
  })

  it("omite el header con header={false}", () => {
    renderShell({ header: false })

    expect(
      screen.queryByRole("navigation", { name: "breadcrumb" })
    ).not.toBeInTheDocument()
  })

  it("lee el estado inicial del sidebar desde la cookie", () => {
    document.cookie = "sidebar_state=false; path=/"
    expect(readSidebarOpen()).toBe(false)

    document.cookie = "sidebar_state=true; path=/"
    expect(readSidebarOpen()).toBe(true)

    document.cookie = "sidebar_state=; path=/; max-age=0"
    expect(readSidebarOpen()).toBe(true)
    expect(readSidebarOpen(false)).toBe(false)
  })
})
