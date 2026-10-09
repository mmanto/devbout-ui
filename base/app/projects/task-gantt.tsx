"use client"

import { cn } from "cn"

import {
  daysBetween,
  formatDate,
  todayIso,
  type Task,
} from "./project-types"

const BAR_CLASS: Record<Task["status"], string> = {
  done: "bg-success",
  in_progress: "bg-info",
  todo: "bg-muted-foreground/60",
}

/**
 * Cronograma de tareas: una fila por tarea con fechas, y una barra proporcional
 * al rango total del proyecto. La línea vertical marca el día de hoy.
 */
export function TaskGantt({ tasks }: { tasks: Task[] }) {
  const dated = tasks.filter((task) => task.startDate && task.endDate)

  if (dated.length === 0) {
    return (
      <div className="rounded-md border px-4 py-10 text-center text-xs text-muted-foreground">
        Ninguna tarea tiene fecha de inicio y fin para dibujar el cronograma.
      </div>
    )
  }

  const start = dated.reduce(
    (min, task) => (task.startDate < min ? task.startDate : min),
    dated[0].startDate
  )
  const end = dated.reduce(
    (max, task) => (task.endDate > max ? task.endDate : max),
    dated[0].endDate
  )
  const totalDays = Math.max(1, daysBetween(start, end) + 1)
  const today = todayIso()
  const todayOffset = daysBetween(start, today)
  const todayPercent =
    todayOffset >= 0 && todayOffset <= totalDays
      ? (todayOffset / totalDays) * 100
      : null

  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground">
        <span className="tabular-nums">{formatDate(start)}</span>
        <span>{totalDays} días</span>
        <span className="tabular-nums">{formatDate(end)}</span>
      </div>

      <ul className="divide-y">
        {dated.map((task) => {
          const offsetDays = Math.max(0, daysBetween(start, task.startDate))
          const spanDays = Math.max(1, daysBetween(task.startDate, task.endDate) + 1)

          return (
            <li key={task.id} className="flex items-center gap-3 px-3 py-2">
              <div className="w-44 shrink-0 truncate text-xs">
                <span className="font-medium">{task.title}</span>
                <span className="text-muted-foreground">
                  {" · "}
                  {task.assignee || "Sin asignar"}
                </span>
              </div>

              <div className="relative h-4 min-w-32 flex-1 rounded-sm bg-muted">
                {todayPercent === null ? null : (
                  <span
                    className="absolute inset-y-0 z-10 w-px bg-foreground/40"
                    style={{ left: `${todayPercent}%` }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={cn(
                    "absolute inset-y-0.5 rounded-sm",
                    BAR_CLASS[task.status]
                  )}
                  style={{
                    left: `${(offsetDays / totalDays) * 100}%`,
                    width: `${(spanDays / totalDays) * 100}%`,
                    minWidth: "0.5rem",
                  }}
                  title={`${task.title}: ${formatDate(task.startDate)} → ${formatDate(task.endDate)}`}
                />
              </div>

              <span className="w-14 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {task.estimatedHours === null ? "—" : `${task.estimatedHours} h`}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center gap-3 border-t px-3 py-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-muted-foreground/60" />
          Por hacer
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-info" />
          En progreso
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-success" />
          Completada
        </span>
        <span className="ml-auto">Línea vertical: hoy</span>
      </div>
    </div>
  )
}
