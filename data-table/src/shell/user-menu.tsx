"use client"

import { Fragment } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LogoutIcon,
  Settings05Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar"
import { resolveLinkRender } from "./link"
import type {
  ShellLabels,
  ShellLinkRender,
  ShellUser,
  ShellUserAction,
} from "./types"

export type AppUserMenuProps = {
  user: ShellUser
  labels?: ShellLabels
  renderLink?: ShellLinkRender
  className?: string
}

function defaultActions(user: ShellUser, labels: ShellLabels = {}) {
  const actions: ShellUserAction[] = []

  if (user.settingsHref) {
    actions.push({
      id: "settings",
      label: labels.settings ?? "Settings",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
      href: user.settingsHref,
    })
  }

  if (user.onLogout) {
    actions.push({
      id: "logout",
      label: labels.logout ?? "Log out",
      icon: <HugeiconsIcon icon={LogoutIcon} strokeWidth={2} />,
      onSelect: user.onLogout,
      separatorBefore: true,
    })
  }

  return actions
}

/**
 * Menú de usuario del footer del sidebar. Sin `user.actions`, arma el menú
 * clásico del shell: Ajustes (si hay `settingsHref`) y Cerrar sesión (si hay
 * `onLogout`). Los textos salen de `labels` con default en inglés.
 */
export function AppUserMenu({
  user,
  labels,
  renderLink,
  className,
}: AppUserMenuProps) {
  const { isMobile } = useSidebar()
  const link = resolveLinkRender(renderLink)

  const actions = user.actions ?? defaultActions(user, labels)

  const initial = (user.name.trim().charAt(0) || "?").toUpperCase()

  return (
    <SidebarMenu className={className}>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar>
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              {user.description ? (
                <span className="truncate text-xs">{user.description}</span>
              ) : null}
            </div>
            <HugeiconsIcon
              icon={UnfoldMoreIcon}
              strokeWidth={2}
              className="ml-auto size-4"
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar>
                    {user.avatarUrl ? (
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                    ) : null}
                    <AvatarFallback>{initial}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    {user.description ? (
                      <span className="truncate text-xs">
                        {user.description}
                      </span>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            {actions.map((action) => (
              <Fragment key={action.id}>
                {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem
                  variant={action.destructive ? "destructive" : "default"}
                  onClick={action.onSelect}
                  render={action.href ? link(action.href) : undefined}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              </Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
