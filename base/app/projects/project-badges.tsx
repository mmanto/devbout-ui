"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

import {
  PRIORITY_LABELS,
  PRIORITY_VARIANT,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VARIANT,
  TASK_STATUS_LABELS,
  TASK_STATUS_VARIANT,
  type Priority,
  type ProjectStatus,
  type TaskStatus,
} from "./project-types"

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={PROJECT_STATUS_VARIANT[status]}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  )
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant={TASK_STATUS_VARIANT[status]}>{TASK_STATUS_LABELS[status]}</Badge>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABELS[priority]}</Badge>
}

/** Barra de progreso con el porcentaje a la derecha. */
export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <Progress
        value={value}
        className="min-w-16"
        indicatorClassName={value >= 100 ? "bg-success" : undefined}
      />
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {value}%
      </span>
    </div>
  )
}
