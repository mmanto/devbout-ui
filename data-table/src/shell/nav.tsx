"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "../ui/sidebar"
import { resolveLinkRender } from "./link"
import type {
  NavItem,
  NavMatch,
  NavSubItem,
  ShellLinkRender,
} from "./types"

/**
 * `prefix` (default) marca activo el ítem en su propia ruta y en las hijas;
 * `exact` sólo en la ruta exacta. Los `href` comodín (`#`, vacío) nunca se
 * marcan activos: son disparadores, no destinos.
 */
export function matchNavHref(
  pathname: string | undefined,
  href: string,
  match: NavMatch = "prefix"
): boolean {
  if (!pathname || !href || href === "#") return false
  if (pathname === href) return true
  if (match === "exact") return false

  const base = href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href
  return pathname.startsWith(base === "/" ? "/" : `${base}/`)
}

function isActive(
  entry: Pick<NavItem | NavSubItem, "href" | "isActive" | "match">,
  pathname: string | undefined
): boolean {
  return entry.isActive ?? matchNavHref(pathname, entry.href, entry.match)
}

export type AppNavProps = {
  items: readonly NavItem[]
  /** Ruta actual; la resuelve el layout del consumidor (`usePathname`). */
  pathname?: string
  renderLink?: ShellLinkRender
  /** Etiqueta opcional del grupo (`SidebarGroupLabel`). */
  label?: string
  className?: string
}

/**
 * Menú lateral declarativo. La rama con hijos usa `Collapsible` y abre el
 * submenú si el ítem o un hijo está activo. Los tamaños y el comportamiento
 * colapsado los resuelve `SidebarMenuButton` / `SidebarMenuSub*`.
 */
export function AppNav({
  items,
  pathname,
  renderLink,
  label,
  className,
}: AppNavProps) {
  const link = resolveLinkRender(renderLink)

  return (
    <SidebarGroup className={className}>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item, pathname)

          if (!item.children?.length) {
            return (
              <SidebarMenuItem key={`${item.href}:${item.title}`}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={item.title}
                  render={link(item.href)}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          const childActive = item.children.some((child) =>
            isActive(child, pathname)
          )

          return (
            <Collapsible
              key={`${item.href}:${item.title}`}
              defaultOpen={item.defaultOpen ?? (active || childActive)}
              className="group/collapsible"
              render={<SidebarMenuItem />}
            >
              <CollapsibleTrigger
                render={
                  <SidebarMenuButton isActive={active} tooltip={item.title} />
                }
              >
                {item.icon}
                <span>{item.title}</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-open/collapsible:rotate-90"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.children.map((child) => (
                    <SidebarMenuSubItem key={`${child.href}:${child.title}`}>
                      <SidebarMenuSubButton
                        isActive={isActive(child, pathname)}
                        render={link(child.href)}
                      >
                        <span>{child.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
