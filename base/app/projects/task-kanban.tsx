"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, MoreHorizontalIcon, Task01Icon } from "@hugeicons/core-free-icons"
import { cn } from "cn"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@mmanto/devbout-ui"
import { Button } from "@mmanto/devbout-ui"

import { PriorityBadge } from "./project-badges"
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  formatShortDate,
  type Task,
  type TaskStatus,
} from "./project-types"

/**
 * Tablero de tareas: una columna por estado, con arrastrar y soltar para
 * cambiar el estado (el movimiento escribe el nuevo estado en la tarea).
 */
export function TaskKanban({
  tasks,
  onMove,
  onEdit,
  onDelete,
}: {
  tasks: Task[]
  onMove: (taskId: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [over, setOver] = React.useState<TaskStatus | null>(null)

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status)

        return (
          <section
            key={status}
            aria-label={TASK_STATUS_LABELS[status]}
            onDragOver={(event) => {
              event.preventDefault()
              setOver(status)
            }}
            onDragLeave={() =>
              setOver((current) => (current === status ? null : current))
            }
            onDrop={(event) => {
              event.preventDefault()
              const id = event.dataTransfer.getData("text/plain") || dragging
              if (id) {
                onMove(id, status)
              }
              setDragging(null)
              setOver(null)
            }}
            className={cn(
              "flex min-h-40 flex-col gap-2 rounded-md border bg-muted/30 p-2 transition-colors",
              over === status && "border-ring bg-accent/40"
            )}
          >
            <header className="flex items-center gap-2 px-1">
              <span className="text-xs font-medium">
                {TASK_STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {columnTasks.length}
              </span>
            </header>

            {columnTasks.map((task) => (
              <article
                key={task.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", task.id)
                  event.dataTransfer.effectAllowed = "move"
                  setDragging(task.id)
                }}
                onDragEnd={() => {
                  setDragging(null)
                  setOver(null)
                }}
                className={cn(
                  "group flex cursor-grab flex-col gap-1.5 rounded-md border bg-card p-2 active:cursor-grabbing",
                  dragging === task.id && "opacity-50"
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="min-w-0 flex-1 text-xs font-medium">
                    {task.title}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-xs" />}
                    >
                      <span className="sr-only">Abrir acciones de la tarea</span>
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                          Editar tarea
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(task)}
                        >
                          Eliminar tarea
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {task.description ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}

                <div className="flex flex-wrap items-center gap-1.5">
                  <PriorityBadge priority={task.priority} />
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-1.5 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Task01Icon} strokeWidth={2} />
                  <span className="truncate" title={task.assignee || undefined}>
                    {task.assignee || "Sin asignar"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
                  <span className="tabular-nums">
                    {formatShortDate(task.startDate)} → {formatShortDate(task.endDate)}
                  </span>
                  {task.estimatedHours === null ? null : (
                    <span className="ml-auto shrink-0 tabular-nums">
                      {task.estimatedHours} h
                    </span>
                  )}
                </div>
              </article>
            ))}

            {columnTasks.length === 0 ? (
              <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                Arrastrá una tarea acá
              </p>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
