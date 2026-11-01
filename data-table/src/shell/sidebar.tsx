"use client"

import type { ReactNode } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../ui/sidebar"
import { AppNav } from "./nav"
import { AppUserMenu } from "./user-menu"
import { resolveLinkRender } from "./link"
import type {
  NavItem,
  ShellBrand,
  ShellLabels,
  ShellLinkRender,
  ShellUser,
} from "./types"

export type AppSidebarProps = {
  nav: readonly NavItem[]
  brand?: ShellBrand
  user?: ShellUser
  labels?: ShellLabels
  renderLink?: ShellLinkRender
  pathname?: string
  collapsible?: "icon" | "offcanvas" | "none"
  /** Reemplaza la marca del header (p. ej. un selector de equipo/organización). */
  header?: ReactNode
  /** Reemplaza el menú de usuario del footer. */
  footer?: ReactNode
  /** Etiqueta opcional del grupo de navegación. */
  navLabel?: string
  navClassName?: string
  className?: string
}

function SidebarBrand({
  brand,
  renderLink,
}: {
  brand: ShellBrand
  renderLink?: ShellLinkRender
}) {
  const link = resolveLinkRender(renderLink)
  const shortTitle = brand.shortTitle ?? brand.title.charAt(0).toUpperCase()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="justify-center px-2"
          tooltip={brand.title}
          render={brand.href ? link(brand.href) : undefined}
        >
          {brand.logo}
          <span className="truncate group-data-[collapsible=icon]:hidden">
            {brand.title}
          </span>
          {brand.logo ? null : (
            <span className="hidden group-data-[collapsible=icon]:inline">
              {shortTitle}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/**
 * Sidebar completa del shell: marca, navegación y usuario. `header` y `footer`
 * son escape hatches para reemplazar cada bloque; el resto sale de `nav` /
 * `user`. Siempre monta el `SidebarRail` (colapsar arrastrando o con ⌘/Ctrl+B).
 */
export function AppSidebar({
  nav,
  brand,
  user,
  labels,
  renderLink,
  pathname,
  collapsible = "icon",
  header,
  footer,
  navLabel,
  navClassName,
  className,
}: AppSidebarProps) {
  return (
    <Sidebar collapsible={collapsible} className={className}>
      <SidebarHeader>
        {header !== undefined
          ? header
          : brand
            ? <SidebarBrand brand={brand} renderLink={renderLink} />
            : null}
      </SidebarHeader>

      <SidebarContent>
        <AppNav
          items={nav}
          pathname={pathname}
          renderLink={renderLink}
          label={navLabel}
          className={navClassName}
        />
      </SidebarContent>

      <SidebarFooter>
        {footer !== undefined
          ? footer
          : user
            ? (
                <AppUserMenu
                  user={user}
                  labels={labels}
                  renderLink={renderLink}
                />
              )
            : null}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
