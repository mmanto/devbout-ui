"use client"

import { type Project, type ProjectStatus } from "./project-types"

const METRICS: { status: ProjectStatus; label: (count: number) => string }[] = [
  {
    status: "active",
    label: (count) => `${count} ${count === 1 ? "activo" : "activos"}`,
  },
  { status: "planning", label: (count) => `${count} en planificación` },
  {
    status: "paused",
    label: (count) => `${count} ${count === 1 ? "pausado" : "pausados"}`,
  },
  {
    status: "completed",
    label: (count) => `${count} ${count === 1 ? "completado" : "completados"}`,
  },
]

/**
 * Cabecera de la grilla de proyectos: título de la página y, debajo, los
 * totales por estado.
 * Se renderiza desde `projectDTO.header`, así que siempre refleja las filas
 * vivas de la tabla.
 */
export function ProjectsHeader({ projects }: { projects: Project[] }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading heading-screen font-medium">Proyectos</h1>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xs text-muted-foreground">
          {projects.length} total
        </span>
        <span aria-hidden="true" className="text-xs text-muted-foreground">
          |
        </span>
        <span className="text-xs text-muted-foreground">
          {METRICS.map((metric) =>
            metric.label(
              projects.filter((project) => project.status === metric.status)
                .length
            )
          ).join(" | ")}
        </span>
      </div>
    </div>
  )
}
