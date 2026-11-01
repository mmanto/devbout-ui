"use client"

import type { ReactNode } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  AppShell,
  type NavItem,
  type ShellUser,
} from "@mmanto/devbout-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AudioWave01Icon,
  CommandIcon,
  ComputerTerminalIcon,
  Folder01Icon,
  LayoutBottomIcon,
  PaletteIcon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons"

import { TeamSwitcher } from "@/components/team-switcher"

/**
 * Datos demo del playground. Este archivo es la integración de referencia del
 * `AppShell` del paquete en Next (App Router): `pathname` sale de
 * `usePathname()` y los links de `next/link`, porque el paquete no conoce el
 * router.
 */
const teams = [
  {
    name: "Acme Inc",
    logo: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: <HugeiconsIcon icon={AudioWave01Icon} strokeWidth={2} />,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: <HugeiconsIcon icon={CommandIcon} strokeWidth={2} />,
    plan: "Free",
  },
]

const nav: NavItem[] = [
  {
    title: "Deployments",
    href: "/deployments",
    icon: <HugeiconsIcon icon={Rocket01Icon} strokeWidth={2} />,
  },
  {
    title: "Proyectos",
    href: "/projects",
    icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
  },
  {
    title: "Apariencia",
    href: "/appearance",
    icon: <HugeiconsIcon icon={PaletteIcon} strokeWidth={2} />,
  },
  {
    title: "Playground",
    href: "#",
    icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
    isActive: true,
    children: [
      { title: "History", href: "#" },
      { title: "Starred", href: "#" },
      { title: "Settings", href: "#" },
    ],
  },
]

const user: ShellUser = {
  name: "shadcn",
  description: "m@example.com",
  avatarUrl: "/avatars/shadcn.jpg",
  settingsHref: "/settings/general",
  onLogout: () => undefined,
}

export function AppShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <AppShell
      nav={nav}
      user={user}
      pathname={pathname}
      sidebarHeader={<TeamSwitcher teams={teams} />}
      header={false}
      contentContainer={false}
      renderLink={(href) => <Link href={href} />}
    >
      {children}
    </AppShell>
  )
}
