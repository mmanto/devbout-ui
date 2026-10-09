"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ListViewIcon,
  PencilEdit01Icon,
  PlusSignIcon,
  SquareKanbanIcon,
  TimelineIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "cn"

import { ConfirmDialog } from "@mmanto/devbout-ui"
import { DataTable } from "@mmanto/devbout-ui"
import { CreateEntity } from "@mmanto/devbout-ui"
import { Badge } from "@mmanto/devbout-ui"
import { Button, buttonVariants } from "@mmanto/devbout-ui"

import { ProjectSummary } from "./project-summary"
import { TaskGantt } from "./task-gantt"
import { TaskKanban } from "./task-kanban"
import { taskEntity, taskDTO, taskDelete } from "./task-dto"
import { type Project, type Task, type TaskStatus } from "./project-types"

type ViewId = "list" | "board" | "timeline"

const VIEWS: { id: ViewId; label: string; icon: IconSvgElement }[] = [
  { id: "list", label: "Lista", icon: ListViewIcon },
  { id: "board", label: "Tablero", icon: SquareKanbanIcon },
  { id: "timeline", label: "Gantt", icon: TimelineIcon },
]

/**
 * Detalle de proyecto: resumen, métricas derivadas de las tareas y sección de
 * tareas con tres vistas (lista, tablero y gantt). Es el cuerpo que la entidad
 * Proyecto inyecta como `detail.surface`; el envoltorio (título, descripción y
 * cierre) lo pone {@link DetailEntity}.
 */
export function ProjectDetail({
  project,
  onChange,
}: {
  project: Project
  onChange: (next: Project) => void
}) {
  const [view, setView] = React.useState<ViewId>("list")
  const router = useRouter()
  const [creatingTask, setCreatingTask] = React.useState(false)
  const [pendingDelete, setPendingDelete] = React.useState<Task | null>(null)

  const saveTask = (next: Task) => {
    const exists = project.tasks.some((task) => task.id === next.id)
    onChange({
      ...project,
      tasks: exists
        ? project.tasks.map((task) => (task.id === next.id ? next : task))
        : [...project.tasks, next],
    })
  }

  const removeTask = (task: Task) => {
    onChange({
      ...project,
      tasks: project.tasks.filter((current) => current.id !== task.id),
    })
  }

  const moveTask = (taskId: string, status: TaskStatus) => {
    const task = project.tasks.find((current) => current.id === taskId)
    if (!task || task.status === status) {
      return
    }
    saveTask({ ...task, status })
  }

  // La grilla de tareas reporta sus cambios para que el proyecto los persista.
  const taskTableDTO = React.useMemo(
    () => ({
      ...taskDTO,
      entity: {
        ...taskEntity,
        // La sección de tareas ya tiene su botón de alta.
        create: undefined,
        // Detalle y edición de la tarea se abren en su propia pantalla.
        detail: {
          ...taskEntity.detail,
          href: (task: Task) => `/projects/${project.id}/tasks/${task.id}`,
        },
        edit: {
          ...taskEntity.edit,
          href: (task: Task) => `/projects/${project.id}/tasks/${task.id}/edit`,
        },
      },
      onDataChange: (tasks: Task[]) => onChange({ ...project, tasks }),
    }),
    [project, onChange]
  )

  return (
    <>
      <div className="flex flex-col gap-4">
        <ProjectSummary
          project={project}
          action={
            <Link
              href={`/projects/${project.id}/edit`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "ml-auto",
              })}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              Editar proyecto
            </Link>
          }
        />

        <div className="flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            Tareas
            <Badge variant="secondary">{project.tasks.length}</Badge>
          </h3>
          <div className="ml-auto flex items-center gap-2">
            <div
              role="tablist"
              aria-label="Vista de tareas"
              className="flex items-center rounded-md border p-0.5"
            >
              {VIEWS.map((item) => (
                <Button
                  key={item.id}
                  role="tab"
                  aria-selected={view === item.id}
                  variant={view === item.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setView(item.id)}
                  className={cn(view !== item.id && "text-muted-foreground")}
                >
                  <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                  {item.label}
                </Button>
              ))}
            </div>
            <Button size="sm" onClick={() => setCreatingTask(true)}>
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              Nueva tarea
            </Button>
          </div>
        </div>

        {view === "list" ? (
          <DataTable dto={taskTableDTO} data={project.tasks} />
        ) : view === "board" ? (
          <TaskKanban
            tasks={project.tasks}
            onMove={moveTask}
            onEdit={(task) =>
              router.push(`/projects/${project.id}/tasks/${task.id}/edit`)
            }
            onDelete={setPendingDelete}
          />
        ) : (
          <TaskGantt tasks={project.tasks} />
        )}
      </div>

      {creatingTask ? (
        <CreateEntity
          entity={taskEntity}
          open
          onOpenChange={(open) => {
            if (!open) setCreatingTask(false)
          }}
          onSaved={(task) => {
            if (task) saveTask(task)
            setCreatingTask(false)
          }}
        />
      ) : null}

      {pendingDelete ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingDelete(null)
          }}
          title={taskDelete.title}
          message={taskDelete.message(1)}
          confirmLabel={taskDelete.confirmLabel}
          cancelLabel={taskDelete.cancelLabel}
          onConfirm={() => {
            removeTask(pendingDelete)
            setPendingDelete(null)
          }}
        />
      ) : null}
    </>
  )
}
