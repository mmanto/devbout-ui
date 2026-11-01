import { createElement, type ReactElement } from "react"

import type { ShellLinkRender } from "./types"

/**
 * Link por defecto del shell cuando la app no inyecta `renderLink`: un ancla
 * común. No hace `preventDefault` ni navegación programática a propósito; las
 * apps con router pasan el suyo (`next/link`, `react-router`).
 */
export function defaultRenderLink(href: string): ReactElement {
  return createElement("a", { href })
}

export function resolveLinkRender(
  renderLink: ShellLinkRender | undefined
): ShellLinkRender {
  return renderLink ?? defaultRenderLink
}
