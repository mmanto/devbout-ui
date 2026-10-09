"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { EditEntity } from "@/components/data-table/entity-form"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import { taskEdit } from "../../../../task-dto"
import { useProjects } from "../../../../projects-store"
import { type Task } from "../../../../project-types"

/**
 * Pantalla propia de edición de una tarea, hermana de la de proyecto: entra
 * desde el detalle, guarda o cancela y vuelve al detalle de la tarea.
 */
export function EditTaskScreen({
  projectId,
  taskId,
}: {
  projectId: string
  taskId: string
}) {
  const router = useRouter()
  const { projects, updateProject } = useProjects()

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

  const back = () => router.push(`/projects/${projectId}/tasks/${taskId}`)

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
                <BreadcrumbPage>Editar</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <EditEntity
          edit={taskEdit}
          row={task}
          open
          mode="page"
          onOpenChange={(open) => {
            if (!open) back()
          }}
          onSubmit={(next: Task) => {
            updateProject({
              ...project,
              tasks: project.tasks.map((current) =>
                current.id === next.id ? next : current
              ),
            })
            back()
          }}
        />
      </div>
    </>
  )
}
