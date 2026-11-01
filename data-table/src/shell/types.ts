import type { ReactElement, ReactNode } from "react"

/**
 * Cómo se pinta un link del shell. El paquete es agnóstico de router: Next
 * pasa `<Link href>`, React Router pasa `<Link to>` y una app sin router deja
 * el default (`<a href>`). Es el equivalente de `EntityNavigateProvider` para
 * la navegación del shell, pero por `render` de Base UI.
 */
export type ShellLinkRender = (href: string) => ReactElement

/** `prefix` (default) marca activo el ítem en `href` y en sus descendientes. */
export type NavMatch = "exact" | "prefix"

export type NavSubItem = {
  title: string
  href: string
  /** Sobrescribe la detección contra `pathname`. */
  isActive?: boolean
  match?: NavMatch
}

/** Ítem del menú lateral; con `children` se vuelve un submenú colapsable. */
export type NavItem = {
  title: string
  href: string
  icon?: ReactNode
  /** Sobrescribe la detección contra `pathname`. */
  isActive?: boolean
  match?: NavMatch
  children?: readonly NavSubItem[]
  /**
   * Estado inicial del submenú. Default: abierto si el ítem o algún hijo está
   * activo.
   */
  defaultOpen?: boolean
}

/** Marca del sidebar: título completo, inicial para el modo icono y link. */
export type ShellBrand = {
  title: string
  /** Texto visible con el sidebar colapsado. Default: primera letra del título. */
  shortTitle?: string
  href?: string
  /** Reemplaza el texto por (o acompaña a) un logo. */
  logo?: ReactNode
}

/** Acción del menú de usuario. `href` usa `renderLink`; `onSelect` es un handler. */
export type ShellUserAction = {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  onSelect?: () => void
  destructive?: boolean
  separatorBefore?: boolean
}

/**
 * Bloque de usuario del sidebar. Si no se declara `actions`, el menú se arma
 * con `settingsHref` (Ajustes) y `onLogout` (Cerrar sesión), en ese orden.
 */
export type ShellUser = {
  name: string
  description?: string
  avatarUrl?: string
  actions?: readonly ShellUserAction[]
  settingsHref?: string
  onLogout?: () => void
}

/** Textos del chrome que el paquete no puede derivar. Defaults en inglés. */
export type ShellLabels = {
  settings?: string
  logout?: string
  /** Fallback del breadcrumb cuando el pathname no matchea ningún ítem. */
  home?: string
}

/** Migaja del header. La última se pinta como página actual (sin link). */
export type ShellCrumb = {
  label: string
  href?: string
}
