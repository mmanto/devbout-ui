"use client"

import { Button } from "@/components/ui/button"
import { EntityView } from "@/components/entity-view"

import type { DetailDTO } from "./types"

export function DetailEntity<TData>({
  detail,
  row,
  open,
  onOpenChange,
}: {
  detail: DetailDTO<TData>
  row: TData
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <EntityView
      open={open}
      onOpenChange={onOpenChange}
      title={typeof detail.title === "function" ? detail.title(row) : detail.title}
      description={
        typeof detail.description === "function"
          ? detail.description(row)
          : detail.description
      }
      closeLabel={detail.closeLabel}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {detail.closeLabel ?? "Close"}
          </Button>
        </div>
      }
    >
      <dl className="grid gap-4">
        {detail.fields?.map((field) => (
          <div key={field.label} className="grid gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              {field.label}
            </dt>
            <dd className="text-sm">{field.value(row)}</dd>
          </div>
        ))}
      </dl>
    </EntityView>
  )
}
