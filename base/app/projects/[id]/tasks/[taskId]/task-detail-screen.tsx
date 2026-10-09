"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  PencilEdit01Icon,
  Tag01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@mmanto/devbout-ui"
import { EntityView } from "@mmanto/devbout-ui"
import { buttonVariants } from "@mmanto/devbout-ui"
import { Separator } from "@mmanto/devbout-ui"
import { SidebarTrigger } from "@mmanto/devbout-ui"

import { PriorityBadge, TaskStatusBadge } from "../../../project-badges"
import { taskDetail } from "../../../task-dto"
import { daysBetween, formatDate, type Task } from "../../../project-types"
import { useProjects } from "../../../projects-store"

/**
 * Línea de métricas de la tarea: duración y estimación. Se lee igual que las
 * métricas derivadas del detalle de proyecto.
 */
function TaskMetrics({ task }: { task: Task }) {
  const days = daysBetween(task.startDate, task.endDate)

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-xs text-muted-foreground tabular-nums">
        {days} días
      </span>
      <span aria-hidden="true" className="text-xs text-muted-foreground">
        |
      </span>
      <span className="text-xs text-muted-foreground">
        {task.estimatedHours === null
          ? "Sin estimar"
          : `${task.estimatedHours} h estimadas`}
      </span>
    </div>
  )
}

/**
 * Pantalla propia del detalle de tarea, hermana del detalle de proyecto:
 * métricas, estado con el acceso a la edición (que también tiene su pantalla) y
 * los datos generales.
 */
export function TaskDetailScreen({
  projectId,
  taskId,
}: {
  projectId: string
  taskId: string
}) {
  const router = useRouter()
  const { projects } = useProjects()

  const project = projects.find((current) => current.id === projectId)
  const task = project?.tasks.find((current) => current.id === taskId)

  if (!project || !task) {
    return (
      <div className="flex flex-1 flex-col items-start gap-4 p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          La tarea no existe o fue eliminada.
        </p>
        <Link
          href="/projects"
          className={buttonVariants({ variant: "outline" })}
        >
          Volver a proyectos
        </Link>
      </div>
    )
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/projects" />}>
                  Proyectos
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{project.name}</BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tarea</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <EntityView
          open
          mode="page"
          onOpenChange={(open) => {
            if (!open) router.push("/projects")
          }}
          title={
            typeof taskDetail.title === "function"
              ? taskDetail.title(task)
              : taskDetail.title
          }
          description={
            typeof taskDetail.description === "function"
              ? taskDetail.description(task)
              : taskDetail.description
          }
          backLabel={taskDetail.closeLabel}
        >
          <div className="flex flex-col gap-4">
            <TaskMetrics task={task} />

            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <Link
                href={`/projects/${projectId}/tasks/${taskId}/edit`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "ml-auto",
                })}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
                Editar tarea
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                {task.assignee || "Sin asignar"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} />
                <span className="tabular-nums">
                  {formatDate(task.startDate)} → {formatDate(task.endDate)}
                </span>
              </span>
              {task.tags.length ? (
                <span className="inline-flex items-center gap-1.5">
                  <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
                  {task.tags.join(", ")}
                </span>
              ) : null}
            </div>
          </div>
        </EntityView>
      </div>
    </>
  )
}
