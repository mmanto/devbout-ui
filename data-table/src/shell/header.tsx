"use client"

import { Fragment, type ReactNode } from "react"

import { cn } from "../lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import { Separator } from "../ui/separator"
import { SidebarTrigger } from "../ui/sidebar"
import { resolveLinkRender } from "./link"
import { matchNavHref } from "./nav"
import type {
  NavItem,
  ShellCrumb,
  ShellLabels,
  ShellLinkRender,
} from "./types"

export type AppHeaderProps = {
  /** Ruta actual, para derivar el breadcrumb cuando no se pasan `crumbs`. */
  pathname?: string
  nav?: readonly NavItem[]
  /** Migajas explícitas; reemplazan la derivación desde `pathname` + `nav`. */
  crumbs?: readonly ShellCrumb[]
  labels?: ShellLabels
  renderLink?: ShellLinkRender
  /** Acciones alineadas a la derecha (notificaciones, tema, etc.). */
  actions?: ReactNode
  className?: string
}

/**
 * Migaja única derivada del menú: primero un match exacto (hijo incluido),
 * después el prefijo más largo. Sin match, usa el primer segmento del path; sin
 * path, `labels.home`. Es la regla de `AdminHeader` de gestion.ar.
 */
function resolveCrumbs(
  pathname: string | undefined,
  nav: readonly NavItem[] | undefined,
  labels: ShellLabels | undefined
): readonly ShellCrumb[] {
  if (pathname && nav?.length) {
    const entries = nav.flatMap((item) => [item, ...(item.children ?? [])])
    const exact = entries.find((entry) => pathname === entry.href)
    if (exact) return [{ label: exact.title }]

    const prefix = entries
      .filter((entry) => matchNavHref(pathname, entry.href))
      .sort((a, b) => b.href.length - a.href.length)[0]
    if (prefix) return [{ label: prefix.title }]
  }

  if (pathname) {
    const segment = pathname.split("/").filter(Boolean)[0]
    if (segment) {
      return [{ label: segment.charAt(0).toUpperCase() + segment.slice(1) }]
    }
  }

  return [{ label: labels?.home ?? "Home" }]
}

/**
 * Header del área de contenido: disparador del sidebar, separador y
 * breadcrumb. `h-16`, `h-12` cuando el sidebar está colapsado (el primitivo
 * expone `group-data-[collapsible=icon]` en el wrapper). En mobile las migajas
 * intermedias se ocultan y queda sólo la actual.
 */
export function AppHeader({
  pathname,
  nav,
  crumbs,
  labels,
  renderLink,
  actions,
  className,
}: AppHeaderProps) {
  const link = resolveLinkRender(renderLink)
  const items = crumbs ?? resolveCrumbs(pathname, nav, labels)

  return (
    <header
      className={cn(
        "flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-vertical:h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1

              return (
                <Fragment key={`${item.label}:${index}`}>
                  {index > 0 ? (
                    <BreadcrumbSeparator className="hidden md:block" />
                  ) : null}
                  <BreadcrumbItem
                    className={isLast ? undefined : "hidden md:block"}
                  >
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink render={link(item.href)}>
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions ? (
        <div className="ml-auto flex items-center gap-2 pr-4">{actions}</div>
      ) : null}
    </header>
  )
}
