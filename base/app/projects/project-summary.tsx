"use client"

import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@mmanto/devbout-ui"

import { PriorityBadge, ProjectStatusBadge } from "./project-badges"
import {
  countTasks,
  formatDate,
  projectProgress,
  type Project,
  type TaskStatus,
} from "./project-types"

/** Totales por estado de las tareas, en el formato de la cabecera de Proyectos. */
const TASK_METRICS: { status: TaskStatus; label: (count: number) => string }[] =
  [
    { status: "todo", label: (count) => `${count} por hacer` },
    { status: "in_progress", label: (count) => `${count} en progreso` },
    {
      status: "done",
      label: (count) =>
        `${count} ${count === 1 ? "completada" : "completadas"}`,
    },
  ]

/**
 * Línea de estadísticas de las tareas: total, totales por estado y el progreso
 * derivado. Se lee igual que los totales de la grilla de Proyectos, que la
 * muestran debajo del título de la página.
 */
function TaskStats({ project }: { project: Project }) {
  const metrics = TASK_METRICS.map((metric) =>
    metric.label(countTasks(project, metric.status))
  )

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-xs text-muted-foreground">
        {project.tasks.length} total
      </span>
      <span aria-hidden="true" className="text-xs text-muted-foreground">
        |
      </span>
      <span className="text-xs text-muted-foreground">
        {[...metrics, `${projectProgress(project)}%`].join(" | ")}
      </span>
    </div>
  )
}

/**
 * Resumen de un proyecto: métricas de tareas, estado y datos generales. Es la
 * cabecera que comparten la pantalla de detalle y la de edición, para que esta
 * última se lea igual que el detalle.
 *
 * Renderiza tres bloques dentro de un contenedor con `gap`, que aporta quien lo
 * usa. `action` se muestra al final de la fila de estado (por ejemplo el acceso
 * a la edición desde el detalle).
 */
export function ProjectSummary({
  project,
  action,
}: {
  project: Project
  action?: ReactNode
}) {
  return (
    <>
      <TaskStats project={project} />

      <div className="flex flex-wrap items-center gap-2">
        <ProjectStatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
        <Badge variant="outline">{project.business || "Sin negocio"}</Badge>
        {action}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
          <span className="tabular-nums">
            {formatDate(project.startDate)} → {formatDate(project.endDate)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
          {project.team.length ? project.team.join(", ") : "Sin equipo"}
        </span>
      </div>
    </>
  )
}
