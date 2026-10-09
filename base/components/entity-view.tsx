"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export type EntityViewMode = "modal" | "drawer" | "page"

const STORAGE_KEY = "entity-view-mode"
const DEFAULT_MODE: EntityViewMode = "drawer"

// Preference is an external store (localStorage) so it survives reloads and
// stays in sync across tabs. Kept in memory too, for environments where
// storage is blocked.
const listeners = new Set<() => void>()
let memoryMode: EntityViewMode = DEFAULT_MODE

function readMode(): EntityViewMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === "modal" || stored === "drawer" || stored === "page") {
      return stored
    }
  } catch {
    // Storage unavailable (private mode, blocked cookies).
  }
  return memoryMode
}

function writeMode(mode: EntityViewMode) {
  memoryMode = mode
  try {
    window.localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    // Persisting is best-effort; the in-memory mode still applies.
  }
  listeners.forEach((listener) => listener())
}

function subscribeMode(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

interface EntityViewContextValue {
  mode: EntityViewMode
  setMode: (mode: EntityViewMode) => void
}

const EntityViewContext = React.createContext<EntityViewContextValue | null>(
  null
)

export function EntityViewProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const mode = React.useSyncExternalStore(
    subscribeMode,
    readMode,
    () => DEFAULT_MODE
  )

  const value = React.useMemo(() => ({ mode, setMode: writeMode }), [mode])

  return (
    <EntityViewContext.Provider value={value}>
      {children}
    </EntityViewContext.Provider>
  )
}

export function useEntityViewMode() {
  const context = React.useContext(EntityViewContext)
  if (!context) {
    throw new Error(
      "useEntityViewMode must be used within an EntityViewProvider"
    )
  }
  return context
}

/**
 * Wrapper of the view body: a form when the view submits something, otherwise a
 * plain container. A form without `onSubmit` would submit natively (reloading
 * the page) the moment a nested control fires Enter.
 */
function ViewContainer({
  onSubmit,
  className,
  children,
}: {
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  className?: string
  children: React.ReactNode
}) {
  if (!onSubmit) {
    return <div className={className}>{children}</div>
  }
  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
    </form>
  )
}

interface EntityViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  /**
   * Surface to render, overriding the global preference. Used by entity views
   * that live on their own route and must always fill the screen.
   */
  mode?: EntityViewMode
  description?: React.ReactNode
  /** Accessible name of the built-in close button. */
  closeLabel?: string
  /** Accessible name of the back button shown in page mode. */
  backLabel?: string
  /** Actions rendered at the bottom of the view. */
  footer?: React.ReactNode
  /** Wraps the view in a form; the whole view is the form. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>
  /**
   * Extra classes for the surface, per surface mode. A mode left out keeps the
   * primitive's own sizing: a centered modal, a sidebar-width drawer, and a
   * page that fills the width it is given.
   */
  className?: Partial<Record<EntityViewMode, string>>
  children: React.ReactNode
}

/**
 * Renders the create / edit / detail surface of an entity as a centered modal,
 * a side drawer, or a full screen, following the global
 * {@link useEntityViewMode} preference configured in Settings › General.
 */
export function EntityView({
  open,
  onOpenChange,
  title,
  mode: forcedMode,
  description,
  closeLabel,
  backLabel,
  footer,
  onSubmit,
  className,
  children,
}: EntityViewProps) {
  const { mode: preferredMode } = useEntityViewMode()
  const mode = forcedMode ?? preferredMode

  if (mode === "page") {
    return (
      <div
        className={cn("flex min-h-0 w-full flex-1 flex-col", className?.page)}
      >
        <ViewContainer
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              <span className="sr-only">{backLabel ?? "Back"}</span>
            </Button>
            <div className="flex flex-col gap-0.5">
              <h2 className="font-heading heading-section font-medium">
                {title}
              </h2>
              {description ? (
                <p className="text-xs/relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
            {children}
          </div>
          {footer ? <div className="mt-4 border-t pt-4">{footer}</div> : null}
        </ViewContainer>
      </div>
    )
  }

  if (mode === "modal") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className?.modal} closeLabel={closeLabel}>
          <ViewContainer
            onSubmit={onSubmit}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer ? <DialogFooter>{footer}</DialogFooter> : null}
          </ViewContainer>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={className?.drawer} closeLabel={closeLabel}>
        <ViewContainer onSubmit={onSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description ? (
              <SheetDescription>{description}</SheetDescription>
            ) : null}
          </SheetHeader>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
            {children}
          </div>
          {footer ? <SheetFooter>{footer}</SheetFooter> : null}
        </ViewContainer>
      </SheetContent>
    </Sheet>
  )
}
