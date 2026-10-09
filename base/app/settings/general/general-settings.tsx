"use client"

import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  FullScreenIcon,
  LayoutPanelLeftIcon,
  Square01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { CreateEntity, EditEntity } from "@/components/data-table/entity-form"
import { DetailEntity } from "@/components/data-table/entity-detail"
import {
  useEntityViewMode,
  type EntityViewMode,
} from "@/components/entity-view"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import {
  deployCreate,
  deployDetail,
  deployEdit,
  type Deployment,
} from "@/app/deployments/deploy-dto"

const sample: Deployment = {
  project: "acme-web",
  branch: "main",
  status: "Ready",
  duration: "42s",
}

const modes: {
  value: EntityViewMode
  label: string
  description: string
  icon: IconSvgElement
}[] = [
  {
    value: "modal",
    label: "Modal",
    description: "Centered dialog on top of the page.",
    icon: Square01Icon,
  },
  {
    value: "drawer",
    label: "Drawer",
    description: "Panel docked to the right edge.",
    icon: LayoutPanelLeftIcon,
  },
  {
    value: "page",
    label: "Page",
    description: "Full screen inside the app, replacing the table.",
    icon: FullScreenIcon,
  },
]

export function GeneralSettings() {
  const { mode, setMode } = useEntityViewMode()
  const [preview, setPreview] = React.useState<
    "create" | "edit" | "detail" | null
  >(null)

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading heading-screen font-medium">General</h1>
        <p className="text-sm text-muted-foreground">
          Configure how the application presents its entity views.
        </p>
      </div>

      <Separator />

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading heading-section font-medium">
            Entity views
          </h2>
          <p className="text-xs/relaxed text-muted-foreground">
            Choose how the create, edit and detail views of an entity are
            displayed. Page replaces the table with a full screen; modal and
            drawer float the same views over it.
          </p>
        </div>
        <div
          role="radiogroup"
          aria-label="Entity view presentation"
          className="grid gap-3 sm:grid-cols-3"
        >
          {modes.map((option) => {
            const active = option.value === mode
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(option.value)}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                  active
                    ? "border-ring bg-muted/50 ring-2 ring-ring/30"
                    : "border-border hover:bg-muted/40"
                )}
              >
                <HugeiconsIcon
                  icon={option.icon}
                  strokeWidth={2}
                  className="mt-0.5 size-4 text-muted-foreground"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium">{option.label}</span>
                  <span className="text-xs/relaxed text-muted-foreground">
                    {option.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading heading-section font-medium">Preview</h2>
          <p className="text-xs/relaxed text-muted-foreground">
            The sample <span className="font-mono">acme-web</span> deployment
            opens in the {mode} view.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setPreview("create")}>
            Add project
          </Button>
          <Button variant="outline" onClick={() => setPreview("edit")}>
            Edit deployment
          </Button>
          <Button variant="outline" onClick={() => setPreview("detail")}>
            View deployment
          </Button>
        </div>
      </section>

      {preview === "create" ? (
        <CreateEntity
          create={deployCreate}
          open
          onOpenChange={(open) => {
            if (!open) setPreview(null)
          }}
          onSubmit={() => setPreview(null)}
        />
      ) : null}
      {preview === "edit" ? (
        <EditEntity
          edit={deployEdit}
          row={sample}
          open
          onOpenChange={(open) => {
            if (!open) setPreview(null)
          }}
          onSubmit={() => setPreview(null)}
        />
      ) : null}
      {preview === "detail" ? (
        <DetailEntity
          detail={deployDetail}
          row={sample}
          open
          onOpenChange={(open) => {
            if (!open) setPreview(null)
          }}
        />
      ) : null}
    </div>
  )
}
