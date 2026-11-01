"use client"

import type { ReactNode } from "react"

import { cn } from "../lib/utils"
import {
  SIDEBAR_COOKIE_NAME,
  SidebarInset,
  SidebarProvider,
} from "../ui/sidebar"
import { AppHeader } from "./header"
import { AppSidebar } from "./sidebar"
import type {
  NavItem,
  ShellBrand,
  ShellCrumb,
  ShellLabels,
  ShellLinkRender,
  ShellUser,
} from "./types"

/**
 * Estado inicial del sidebar desde la cookie que escribe `SidebarProvider`
 * (`sidebar_state`, 7 días). Llamalo desde un componente de cliente —un layout
 * SPA o el wrapper `"use client"` de Next— y pasalo como `defaultOpen` para
 * evitar el salto expandido → colapsado en cada recarga. En SSR devuelve
 * `fallback`.
 */
export function readSidebarOpen(fallback = true): boolean {
  if (typeof document === "undefined") return fallback

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SIDEBAR_COOKIE_NAME}=([^;]*)`)
  )
  return match ? match[1] === "true" : fallback
}

export type AppShellProps = {
  children: ReactNode
  nav: readonly NavItem[]
  brand?: ShellBrand
  user?: ShellUser
  labels?: ShellLabels
  /** Link del router del consumidor; default `<a href>`. */
  renderLink?: ShellLinkRender
  /** Ruta actual, para marcar el ítem activo y derivar el breadcrumb. */
  pathname?: string
  /** Migajas explícitas del header; reemplazan la derivación. */
  crumbs?: readonly ShellCrumb[]
  /** Reemplaza el `AppHeader`. `false` lo omite (la app pinta su propio header). */
  header?: ReactNode | false
  /** Acciones a la derecha del `AppHeader` (notificaciones, tema, etc.). */
  headerActions?: ReactNode
  /** Reemplaza la marca del sidebar (p. ej. selector de organización). */
  sidebarHeader?: ReactNode
  /** Reemplaza el menú de usuario del sidebar. */
  sidebarFooter?: ReactNode
  navLabel?: string
  defaultOpen?: boolean
  collapsible?: "icon" | "offcanvas" | "none"
  /**
   * Envuelve los children en el contenedor estándar (`flex flex-1 flex-col
   * gap-4 p-4 pt-0`). `false` los deja directo en el `SidebarInset`, para apps
   * que ya manejan su propio padding por página.
   */
  contentContainer?: boolean
  contentClassName?: string
  className?: string
  sidebarClassName?: string
  navClassName?: string
}

/**
 * Shell de aplicación: `SidebarProvider` + sidebar colapsable + `SidebarInset`
 * con header (trigger, separador y breadcrumb) y contenedor de contenido.
 *
 * Es agnóstico de router: la ruta entra por `pathname` y los links por
 * `renderLink`. En Next, `AppShell` va dentro de un componente `"use client"`
 * que lea `usePathname()` y pase `next/link`; en React Router, el layout ya es
 * cliente y pasa `useLocation()` + `Link to`.
 *
 * ```tsx
 * const dto = { nav, brand, user }
 * <AppShell {...dto} pathname={pathname} renderLink={(href) => <Link to={href} />}>
 *   {children}
 * </AppShell>
 * ```
 */
export function AppShell({
  children,
  nav,
  brand,
  user,
  labels,
  renderLink,
  pathname,
  crumbs,
  header,
  headerActions,
  sidebarHeader,
  sidebarFooter,
  navLabel,
  defaultOpen,
  collapsible,
  contentContainer = true,
  contentClassName,
  className,
  sidebarClassName,
  navClassName,
}: AppShellProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} className={className}>
      <AppSidebar
        nav={nav}
        brand={brand}
        user={user}
        labels={labels}
        renderLink={renderLink}
        pathname={pathname}
        collapsible={collapsible}
        header={sidebarHeader}
        footer={sidebarFooter}
        navLabel={navLabel}
        navClassName={navClassName}
        className={sidebarClassName}
      />

      <SidebarInset>
        {header === false ? null : header !== undefined ? (
          header
        ) : (
          <AppHeader
            pathname={pathname}
            nav={nav}
            crumbs={crumbs}
            labels={labels}
            renderLink={renderLink}
            actions={headerActions}
          />
        )}

        {contentContainer ? (
          <div
            className={cn(
              "flex flex-1 flex-col gap-4 p-4 pt-0",
              contentClassName
            )}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
